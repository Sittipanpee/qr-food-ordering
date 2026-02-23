'use client';

import { useEffect, useState, use, useRef } from 'react';
import { api } from '@/lib/mock-api';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Copy, Download, Clock, Users, Check, Loader2, Bell, BellOff } from 'lucide-react';
import QRCode from 'react-qr-code';
import {
  requestNotificationPermission,
  getNotificationPermission,
  notifyOrderReady,
  notifyOrderStatusChange,
  isNotificationSupported,
} from '@/lib/utils/notifications';

interface PageProps {
  params: Promise<{ queueId: string }>;
}

export default function QueueTicketPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const queueId = resolvedParams.queueId;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeQueues, setActiveQueues] = useState<Order[]>([]);
  const [estimatedWaitPerQueue, setEstimatedWaitPerQueue] = useState(5); // Default 5 minutes

  // Notification states
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const previousStatusRef = useRef<string | null>(null);

  const ticketUrl = typeof window !== 'undefined' ? `${window.location.origin}/queue/${queueId}` : '';

  useEffect(() => {
    loadOrderData();
    // Simulate real-time updates every 5 seconds
    const interval = setInterval(loadOrderData, 5000);
    return () => clearInterval(interval);
  }, [queueId]);

  // Check notification permission on mount
  useEffect(() => {
    if (isNotificationSupported()) {
      const permission = getNotificationPermission();
      setNotificationPermission(permission);

      // Show prompt if permission not decided yet
      if (permission === 'default') {
        // Wait 3 seconds before showing prompt (better UX)
        setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 3000);
      }
    }
  }, []);

  // Watch for status changes and send notifications
  useEffect(() => {
    if (!order) return;

    const currentStatus = order.status;
    const previousStatus = previousStatusRef.current;

    // Only notify if status actually changed
    if (previousStatus && previousStatus !== currentStatus && notificationPermission === 'granted') {
      const statusLabels: Record<string, string> = {
        pending: 'รอยืนยัน',
        confirmed: 'ยืนยันแล้ว',
        preparing: 'กำลังเตรียม',
        ready: 'พร้อมรับแล้ว!',
        completed: 'เสร็จสิ้น',
        cancelled: 'ยกเลิก',
      };

      // Special notification for "ready" status
      if (currentStatus === 'ready') {
        notifyOrderReady(order.order_number, order.queue_number);
      } else {
        notifyOrderStatusChange(
          order.order_number,
          currentStatus,
          statusLabels[currentStatus] || currentStatus
        );
      }
    }

    // Update ref for next comparison
    previousStatusRef.current = currentStatus;
  }, [order?.status, notificationPermission]);

  const loadOrderData = async () => {
    try {
      setIsLoading(true);
      const [orderData, queues, settings] = await Promise.all([
        api.orders.getById(queueId),
        api.queue.getActiveQueue(),
        api.settings.get(),
      ]);

      if (orderData) {
        setOrder(orderData);

        // Update localStorage
        if (orderData.queue_number) {
          localStorage.setItem('current_queue', JSON.stringify({
            id: orderData.id,
            queue_number: orderData.queue_number,
            created_at: orderData.created_at,
            status: orderData.status,
          }));
        }
      }

      setActiveQueues(queues);
      setEstimatedWaitPerQueue(settings.estimated_wait_per_queue);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(ticketUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      alert('ไม่สามารถคัดลอกลิงก์ได้');
    }
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 512, 512);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `queue-${order?.queue_number}-ticket.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      setShowNotificationPrompt(false);
    } else {
      setNotificationPermission('denied');
      setShowNotificationPrompt(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'รอยืนยัน',
          color: 'bg-warning text-white',
          icon: Clock,
          animation: 'animate-pulse-slow',
          cardBg: 'bg-warning/5 border-warning',
        };
      case 'confirmed':
        return {
          label: 'ยืนยันแล้ว',
          color: 'bg-info text-white',
          icon: Check,
          animation: '',
          cardBg: 'bg-info/5 border-info',
        };
      case 'preparing':
        return {
          label: 'กำลังเตรียม 👨‍🍳',
          color: 'bg-orange-500 text-white',
          icon: Loader2,
          animation: 'animate-spin-slow',
          cardBg: 'bg-orange-500/5 border-orange-500',
        };
      case 'ready':
        return {
          label: 'พร้อมรับ! 🎉',
          color: 'bg-success text-white',
          icon: Check,
          animation: 'animate-bounce',
          cardBg: 'animate-glow-success border-success',
        };
      case 'completed':
        return {
          label: 'เสร็จสิ้น',
          color: 'bg-muted text-muted-foreground',
          icon: Check,
          animation: '',
          cardBg: 'bg-muted/30 border-muted',
        };
      case 'cancelled':
        return {
          label: 'ยกเลิก',
          color: 'bg-error text-white',
          icon: null,
          animation: '',
          cardBg: 'bg-error/5 border-error',
        };
      default:
        return {
          label: status,
          color: 'bg-muted',
          icon: null,
          animation: '',
          cardBg: 'bg-muted/30',
        };
    }
  };

  if (isLoading && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูลคิว...</p>
        </div>
      </div>
    );
  }

  if (!order || !order.queue_number) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-lg font-semibold mb-2">ไม่พบข้อมูลคิว</p>
          <p className="text-muted-foreground mb-4">คิวนี้อาจถูกยกเลิกหรือไม่มีอยู่ในระบบ</p>
          <Button onClick={() => window.location.href = '/menu?mode=market'}>
            กลับไปหน้าเมนู
          </Button>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const queuesAhead = activeQueues.filter(
    (q) => q.queue_number! < order.queue_number! &&
    (q.status === 'pending' || q.status === 'confirmed' || q.status === 'preparing')
  ).length;
  const estimatedWait = queuesAhead * estimatedWaitPerQueue; // Calculate from settings

  const isReady = order.status === 'ready';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-2xl mx-auto py-8">
        {/* Notification Prompt */}
        {showNotificationPrompt && notificationPermission === 'default' && (
          <Card className="p-6 mb-6 border-2 border-primary bg-primary/5">
            <div className="flex items-start gap-4">
              <Bell className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">🔔 รับการแจ้งเตือนสถานะออเดอร์</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  เปิดการแจ้งเตือนเพื่อรับข้อความแจ้งเตือนเมื่อออเดอร์ของคุณพร้อม
                  คุณจะไม่พลาดการรับอาหารอีกต่อไป!
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleEnableNotifications} size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    เปิดการแจ้งเตือน
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNotificationPrompt(false)}
                  >
                    ไว้ทีหลัง
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Notification Status Indicator */}
        {notificationPermission !== null && (
          <div className="flex justify-end mb-4">
            {notificationPermission === 'granted' ? (
              <Badge variant="outline" className="text-success border-success">
                <Bell className="w-3 h-3 mr-1" />
                การแจ้งเตือนเปิดอยู่
              </Badge>
            ) : notificationPermission === 'denied' ? (
              <Badge variant="outline" className="text-muted-foreground">
                <BellOff className="w-3 h-3 mr-1" />
                การแจ้งเตือนปิดอยู่
              </Badge>
            ) : null}
          </div>
        )}

        {/* Queue Ticket Card */}
        <Card className={`p-8 border-2 ${statusInfo.cardBg} transition-all`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-lg text-muted-foreground mb-2">หมายเลขคิวของคุณ</h1>
            <div className="queue-number-large text-primary mb-2">
              Q {String(order.queue_number).padStart(3, '0')}
            </div>
            <Badge className={`${statusInfo.color} text-base px-4 py-1 ${statusInfo.animation}`}>
              {StatusIcon && <StatusIcon className={`w-4 h-4 mr-1 inline ${order.status === 'preparing' ? 'animate-spin-slow' : ''}`} />}
              {statusInfo.label}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Button
              size="lg"
              variant="outline"
              className="h-14"
              onClick={handleCopyLink}
            >
              {copySuccess ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  คัดลอกแล้ว!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14"
              onClick={handleDownloadQR}
            >
              <Download className="w-5 h-5 mr-2" />
              Save QR
            </Button>
          </div>

          {/* Queue Info */}
          {!isReady && order.status !== 'completed' && (
            <div className="space-y-4 mb-8 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">เวลารอโดยประมาณ</p>
                  <p className="font-semibold">~{estimatedWait} นาที</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">คิวที่รออยู่ข้างหน้า</p>
                  <p className="font-semibold">{queuesAhead} คิว</p>
                </div>
              </div>
            </div>
          )}

          {/* Ready Message */}
          {isReady && (
            <div className="bg-success/10 border-2 border-success rounded-lg p-6 mb-8 text-center animate-bounce">
              <p className="text-2xl font-bold text-success mb-2">🎉 อาหารพร้อมแล้ว!</p>
              <p className="text-success font-semibold">กรุณามารับอาหารที่เคาน์เตอร์</p>
            </div>
          )}

          {/* QR Code */}
          <div className="bg-white p-6 rounded-lg flex justify-center">
            <QRCode
              id="qr-code"
              value={ticketUrl}
              size={200}
              level="H"
            />
          </div>

          {/* Order Summary */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-4">รายการอาหาร</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.menu_item_name} x{item.quantity}
                  </span>
                  <span className="font-semibold">฿{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t">
              <span>ยอดรวม</span>
              <span className="text-primary">฿{order.total_amount}</span>
            </div>
          </div>

          {/* Customer Info */}
          {order.customer_name && (
            <div className="mt-6 pt-6 border-t text-sm text-muted-foreground">
              <p>ชื่อ: {order.customer_name}</p>
              {order.customer_phone && <p>เบอร์: {order.customer_phone}</p>}
            </div>
          )}

          {/* Order Number */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            รหัสออเดอร์: {order.order_number}
          </div>
        </Card>

        {/* Back Button */}
        {order.status === 'completed' && (
          <div className="text-center mt-6">
            <Button
              size="lg"
              onClick={() => {
                localStorage.removeItem('current_queue');
                window.location.href = '/menu?mode=market';
              }}
            >
              สั่งอาหารใหม่
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
