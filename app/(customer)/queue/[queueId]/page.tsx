'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Copy, Download, Clock, Users, Check, Loader2 } from 'lucide-react';
import QRCode from 'react-qr-code';

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

  const ticketUrl = typeof window !== 'undefined' ? `${window.location.origin}/queue/${queueId}` : '';

  useEffect(() => {
    loadOrderData();
    // Simulate real-time updates every 5 seconds
    const interval = setInterval(loadOrderData, 5000);
    return () => clearInterval(interval);
  }, [queueId]);

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
      } else {
        // Clear localStorage if order not found
        localStorage.removeItem('current_queue');
      }

      setActiveQueues(queues);
      setEstimatedWaitPerQueue(settings.estimated_wait_per_queue);
    } catch (error) {
      console.error('Error loading order:', error);
      // Clear localStorage on error
      localStorage.removeItem('current_queue');
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
    // Clear localStorage and redirect
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_queue');
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
        <Card className="p-6 sm:p-8 text-center max-w-md w-full mx-4">
          <div className="mb-4">
            <div className="text-5xl mb-3">😕</div>
            <h2 className="text-lg sm:text-xl font-bold mb-2">ไม่พบข้อมูลคิว</h2>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-sm sm:text-base text-muted-foreground">
              คิวนี้อาจถูกยกเลิก ดำเนินการเสร็จสิ้น หรือหมดอายุแล้ว
            </p>
            <div className="p-3 bg-muted/50 rounded-lg text-left">
              <p className="text-xs sm:text-sm text-muted-foreground">
                <strong>💡 ทำไมถึงเกิดปัญหา?</strong>
              </p>
              <ul className="text-xs sm:text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>คิวอาจถูกยกเลิกโดยร้าน</li>
                <li>ระบบถูก restart ข้อมูลหายไป</li>
                <li>คิวหมดอายุ (เกิน 2 ชั่วโมง)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={() => {
                localStorage.removeItem('current_queue');
                window.location.href = '/menu?mode=market';
              }}
              size="lg"
              className="w-full"
            >
              สั่งอาหารใหม่
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="lg"
              className="w-full"
            >
              ย้อนกลับ
            </Button>
          </div>
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
    <div className="min-h-screen bg-background p-3 sm:p-4">
      <div className="container max-w-2xl mx-auto py-4 sm:py-8">
        {/* Queue Ticket Card */}
        <Card className={`p-4 sm:p-6 md:p-8 border-2 ${statusInfo.cardBg} transition-all`}>
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-sm sm:text-base md:text-lg text-muted-foreground mb-2">หมายเลขคิวของคุณ</h1>
            <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary mb-2 sm:mb-3">
              Q {String(order.queue_number).padStart(3, '0')}
            </div>
            <Badge className={`${statusInfo.color} text-sm sm:text-base px-3 sm:px-4 py-1 ${statusInfo.animation}`}>
              {StatusIcon && <StatusIcon className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 inline ${order.status === 'preparing' ? 'animate-spin-slow' : ''}`} />}
              {statusInfo.label}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
            <Button
              size="lg"
              variant="outline"
              className="h-12 sm:h-14 text-xs sm:text-sm"
              onClick={handleCopyLink}
            >
              {copySuccess ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">คัดลอกแล้ว!</span>
                  <span className="sm:hidden">คัดลอก!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Copy Link</span>
                  <span className="sm:hidden">Copy</span>
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 sm:h-14 text-xs sm:text-sm"
              onClick={handleDownloadQR}
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Save QR</span>
              <span className="sm:hidden">Save</span>
            </Button>
          </div>

          {/* Queue Info */}
          {!isReady && order.status !== 'completed' && (
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 p-3 sm:p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">เวลารอโดยประมาณ</p>
                  <p className="font-semibold text-sm sm:text-base">~{estimatedWait} นาที</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">คิวที่รออยู่ข้างหน้า</p>
                  <p className="font-semibold text-sm sm:text-base">{queuesAhead} คิว</p>
                </div>
              </div>
            </div>
          )}

          {/* Ready Message */}
          {isReady && (
            <div className="bg-success/10 border-2 border-success rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-center animate-bounce">
              <p className="text-xl sm:text-2xl font-bold text-success mb-1 sm:mb-2">🎉 อาหารพร้อมแล้ว!</p>
              <p className="text-success font-semibold text-sm sm:text-base">กรุณามารับอาหารที่เคาน์เตอร์</p>
            </div>
          )}

          {/* QR Code */}
          <div className="bg-white p-4 sm:p-6 rounded-lg flex justify-center">
            <QRCode
              id="qr-code"
              value={ticketUrl}
              size={window.innerWidth < 640 ? 180 : 200}
              level="H"
            />
          </div>

          {/* Order Summary */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">รายการอาหาร</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs sm:text-sm gap-2">
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
