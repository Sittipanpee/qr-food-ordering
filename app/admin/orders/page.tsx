'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/mock-api';
import { Order, OrderStatus, Settings } from '@/lib/types';
import { format } from 'date-fns';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  preparing: 'กำลังทำ',
  ready: 'พร้อมเสิร์ฟ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
};

const statusIcons: Record<OrderStatus, string> = {
  pending: '⏰',
  confirmed: '✅',
  preparing: '👨‍🍳',
  ready: '🎉',
  completed: '✔️',
  cancelled: '❌',
};

const statusClassNames: Record<OrderStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning',
  confirmed: 'bg-info/10 text-info border-info',
  preparing: 'bg-orange-500/10 text-orange-500 border-orange-500',
  ready: 'bg-success/10 text-success border-success',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-error/10 text-error border-error',
};

const statusCardColors: Record<OrderStatus, string> = {
  pending: 'border-warning bg-warning/5',
  confirmed: 'border-info bg-info/5',
  preparing: 'border-orange-500 bg-orange-500/5',
  ready: 'border-success bg-success/5',
  completed: 'border-muted bg-muted/30',
  cancelled: 'border-error bg-error/5',
};

const statusAnimations: Record<OrderStatus, string> = {
  pending: 'animate-pulse-slow',
  confirmed: '',
  preparing: '',
  ready: 'animate-glow-success',
  completed: '',
  cancelled: '',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, settingsData] = await Promise.all([
        api.orders.getAll(),
        api.settings.get(),
      ]);

      // Sort by created_at desc (newest first)
      const sorted = ordersData.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(sorted);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      loadData();

      // Close details dialog if open
      if (selectedOrder?.id === orderId) {
        setDetailsOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'completed',
      completed: null,
      cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const filteredOrders =
    selectedStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: orders.length };
    const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

    statuses.forEach((status) => {
      counts[status] = orders.filter((o) => o.status === status).length;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  const isRestaurantMode = settings?.operation_mode === 'restaurant';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">📋 จัดการออเดอร์</h1>
          <p className="text-muted-foreground mt-1">
            {isRestaurantMode ? 'ออเดอร์ร้านอาหาร' : 'ออเดอร์ตลาดนัด'}
          </p>
        </div>

        <Button variant="outline" onClick={loadData} size="lg" className="h-12">
          🔄 รีเฟรช
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className={`transition-all ${statusCardColors.pending} ${statusCounts.pending > 0 ? statusAnimations.pending : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-warning flex items-center gap-2">
              <span className="text-xl">{statusIcons.pending}</span>
              รอยืนยัน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{statusCounts.pending}</div>
          </CardContent>
        </Card>

        <Card className={`transition-all ${statusCardColors.confirmed} ${statusCounts.confirmed > 0 ? statusAnimations.confirmed : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-info flex items-center gap-2">
              <span className="text-xl">{statusIcons.confirmed}</span>
              ยืนยันแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-info">{statusCounts.confirmed}</div>
          </CardContent>
        </Card>

        <Card className={`transition-all ${statusCardColors.preparing} ${statusCounts.preparing > 0 ? statusAnimations.preparing : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-500 flex items-center gap-2">
              <span className="text-xl">{statusIcons.preparing}</span>
              กำลังทำ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{statusCounts.preparing}</div>
          </CardContent>
        </Card>

        <Card className={`transition-all ${statusCardColors.ready} ${statusCounts.ready > 0 ? statusAnimations.ready : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-success flex items-center gap-2">
              <span className="text-xl">{statusIcons.ready}</span>
              พร้อมเสิร์ฟ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{statusCounts.ready}</div>
          </CardContent>
        </Card>

        <Card className={`transition-all ${statusCardColors.completed}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="text-xl">{statusIcons.completed}</span>
              เสร็จสิ้น
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statusCounts.completed}</div>
          </CardContent>
        </Card>

        <Card className={`transition-all ${statusCardColors.cancelled}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-error flex items-center gap-2">
              <span className="text-xl">{statusIcons.cancelled}</span>
              ยกเลิก
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-error">{statusCounts.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as OrderStatus | 'all')} className="mb-6">
        <TabsList className="h-12">
          <TabsTrigger value="all" className="text-base">ทั้งหมด ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="pending" className="text-base">{statusIcons.pending} รอยืนยัน ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="confirmed" className="text-base">{statusIcons.confirmed} ยืนยันแล้ว ({statusCounts.confirmed})</TabsTrigger>
          <TabsTrigger value="preparing" className="text-base">{statusIcons.preparing} กำลังทำ ({statusCounts.preparing})</TabsTrigger>
          <TabsTrigger value="ready" className="text-base">{statusIcons.ready} พร้อม ({statusCounts.ready})</TabsTrigger>
          <TabsTrigger value="completed" className="text-base">{statusIcons.completed} เสร็จ ({statusCounts.completed})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">
              {selectedStatus === 'all' ? 'ยังไม่มีออเดอร์' : `ไม่มีออเดอร์${statusLabels[selectedStatus as OrderStatus] || selectedStatus}`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);

            return (
              <Card key={order.id} className={`transition-all ${statusCardColors[order.status]} ${statusAnimations[order.status]}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{order.order_number}</span>
                        <Badge className={`${statusClassNames[order.status]} border text-base px-3 py-1`}>
                          <span className="mr-1">{statusIcons[order.status]}</span>
                          {statusLabels[order.status]}
                        </Badge>
                        {order.mode === 'market' && order.queue_number && (
                          <Badge variant="outline" className="text-base px-3 py-1">คิว #{order.queue_number}</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        {isRestaurantMode && order.table_number && (
                          <span>โต๊ะ {order.table_number} • </span>
                        )}
                        {order.customer_name && <span>{order.customer_name} • </span>}
                        {format(new Date(order.created_at), 'dd MMM yyyy HH:mm')}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        ฿{order.total_amount.toFixed(0)}
                      </div>
                      <p className="text-base text-muted-foreground mt-1">
                        {order.items.length} รายการ
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Order Items Summary */}
                  <div className="mb-4 space-y-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.quantity}x {item.menu_item_name}
                        </span>
                        <span>฿{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mb-4 p-4 bg-muted rounded-lg">
                      <p className="text-base font-semibold mb-1">💬 หมายเหตุ:</p>
                      <p className="text-base text-muted-foreground">{order.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => handleViewDetails(order)}
                      className="h-12 text-base"
                    >
                      👁️ ดูรายละเอียด
                    </Button>

                    {nextStatus && (
                      <Button
                        size="lg"
                        onClick={() => handleStatusChange(order.id, nextStatus)}
                        className="h-12 text-base font-semibold"
                      >
                        {statusIcons[nextStatus]} {statusLabels[nextStatus]}
                      </Button>
                    )}

                    {order.status === 'pending' && (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        className="text-destructive h-12 text-base"
                      >
                        ❌ ยกเลิก
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Order Details - {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && format(new Date(selectedOrder.created_at), 'dd MMM yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={`mt-1 ${statusClassNames[selectedOrder.status]}`}>
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                </div>

                {isRestaurantMode && selectedOrder.table_number && (
                  <div>
                    <p className="text-sm font-medium">Table</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedOrder.table_number}
                    </p>
                  </div>
                )}

                {selectedOrder.mode === 'market' && selectedOrder.queue_number && (
                  <div>
                    <p className="text-sm font-medium">Queue Number</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      #{selectedOrder.queue_number}
                    </p>
                  </div>
                )}

                {selectedOrder.customer_name && (
                  <div>
                    <p className="text-sm font-medium">Customer</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedOrder.customer_name}
                    </p>
                  </div>
                )}

                {selectedOrder.customer_phone && (
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedOrder.customer_phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <p className="text-sm font-medium mb-2">Order Items</p>
                <div className="border rounded-lg">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-3 flex justify-between ${
                        index < selectedOrder.items.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      <div>
                        <p className="font-medium">{item.menu_item_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ฿{item.price.toFixed(2)} x {item.quantity}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ฿{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-muted font-semibold flex justify-between">
                    <span>Total</span>
                    <span>฿{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm font-medium mb-2">Order Notes</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="flex gap-2 pt-4">
                {(() => {
                  const nextStatus = getNextStatus(selectedOrder.status);
                  if (nextStatus) {
                    return (
                      <Button
                        onClick={() => handleStatusChange(selectedOrder.id, nextStatus)}
                      >
                        Mark as {statusLabels[nextStatus]}
                      </Button>
                    );
                  }
                  return null;
                })()}

                {selectedOrder.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange(selectedOrder.id, 'cancelled')}
                    className="text-destructive"
                  >
                    Cancel Order
                  </Button>
                )}

                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
