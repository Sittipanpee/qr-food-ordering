'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/mock-api';
import { Order, OrderStatus } from '@/lib/types';
import { format } from 'date-fns';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'New',
  confirmed: 'Accepted',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  preparing: 'bg-orange-500',
  ready: 'bg-green-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

export default function QueueManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Walk-in Queue Dialog
  const [walkInDialogOpen, setWalkInDialogOpen] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [creatingWalkIn, setCreatingWalkIn] = useState(false);

  useEffect(() => {
    loadOrders();

    // Auto-refresh every 3 seconds
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Play notification sound when new order arrives
    if (orders.length > lastOrderCount) {
      const newOrders = orders.filter((o) => o.status === 'pending');
      if (newOrders.length > 0) {
        playNotificationSound();
      }
    }
    setLastOrderCount(orders.length);
  }, [orders]);

  const loadOrders = async () => {
    try {
      const queueOrders = await api.queue.getActiveQueue();
      // Sort by queue number
      const sorted = queueOrders.sort((a, b) => (a.queue_number || 0) - (b.queue_number || 0));
      setOrders(sorted);
    } catch (error) {
      console.error('Error loading queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    // Play beep sound (browser built-in)
    if (typeof window !== 'undefined') {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKzn77dmHAU4k9nyz3omBSh+zPLaizsKFGGz6+utVxMJQ6Hn8bllHgcsgc/y2Yk2CBxqvvPmnE0MDlCq5O+3Zx4GOJTb8s98JgYngMzy2os7ChVhtevurVgSCUOh6PKzZB8HK4HN8tiJNggba77y5ZxODA5PqOPvuGceCDiU2/LPfCgFKIDL8dmLOwsUYbXp7axWEwlCoe3zsmQgCCuBzvHYijgIG2q+8+ScTgwPT6jh7rhkHgk4lNvzz3omByeBzfPaizwLFGC25vCsVxIJQ6Ht9LFlIAgrgs/y2Ik3CBxqvvTlm04MDk+n4e+2ZSEJOJTa88p1KwYogMrz2ow9DBVgtejxrlcSCkGh7vW0ZSEKKoLO8tiKOAgcar3z5JtOCw5Pp+HvtWUhCTmU2vPKdSsHKIDJ89uNPAwUYLTm8a1WEgpBoe71s2QiCiiCzvLYijcIG2m+9eSaThAOTqfe8bZlIQo5lNrzynb6ChVhtujxrVYSCkGh7vOwYyQLKILL8diKNwkcab3y45pQCw5Pp9/xtmMkCzqU2vLJdSwGKIDJ8tuMPQsUX7Tl8a1ZEQpBn+/2smUlCiiCzfLYiTgJHGm+8uObThAOTqfg8bVlJQs6lNrxyXUsCSiAyPPbjDwLFGC06fStWREKQZ/v9LRlIgoofs/y2Yk4CBxpvvLkmlELDk2n3/K1ZiYMOZTb88p1LAYpgMny24w8DBRftujzrFgSCT+f7/K2ZicKKIHN8tmKNwgcar300pxQCw1No+H0tmclCTmU2/PKdSwHKX/I8tqLPQwUX7Xn8atZEgpBn+/ztGYnCSeBy/Lajz0MHGq+8+OaUQsOTaPh9LhmKAo5k9r0yXUtCSiBx/LajTwNFV+16POnWRMKQJ7w9rVmJworgs/w2Is6CRxqvvTkm1EKDUym4fS4aCkLOJTa9Ml1LgYpgcnz2ow8DRVftejyqlkSCkGe8Pa1ZigKKoLO8tmLOwkcarzz45tRCw1MpuH0uWgpCzmT2vPJdS4HKYHJl9qMPQwVYLXo8q1ZEglAnO/3tmgpCimCzvLZjTsMHGq88uKbUQwOTKfh87loKQs5k9rzqHQuCCl/yPLbjD0MFV+06PKvWRIKQZ7u9rZoKQspgc/y2Yw6CxxqvPPinFEMDkym4PO5aCkLOZPa9Kl0LwgqgMnz24w9CxVetujyq1kTCkCd7/e2aSkLKYHO8tmMOwocarzz4p1RDA5LpuH0uWgpCzqT2fOpdC8IKYHI89uMPg0UX7Xo8qxZEwpAnu/3t2gpCyqBzvLZjDsMG2m78uKeUQwOTKfh87loKQo5k9n0qXQvByqAyPPbjD0NFV+16PKsWRMKP57v97hnKgspgc/y2Y48DBtpvfPinFAMDkyn4PK4Zykq+ZPZ9Kl0LgYqf8nz2ow+DBVfta==');
      audio.play().catch(console.error);
    }
  };

  const handleCreateWalkInQueue = async () => {
    setCreatingWalkIn(true);
    try {
      await api.queue.createWalkInQueue({
        customer_name: walkInName.trim() || 'Walk-in Customer',
        customer_phone: walkInPhone.trim() || undefined,
      });

      // Reset form
      setWalkInName('');
      setWalkInPhone('');
      setWalkInDialogOpen(false);

      // Reload orders
      await loadOrders();

      alert('เพิ่มคิวหน้าร้านสำเร็จ!');
    } catch (error) {
      console.error('Error creating walk-in queue:', error);
      alert('ไม่สามารถเพิ่มคิวได้');
    } finally {
      setCreatingWalkIn(false);
    }
  };

  const handleAcceptOrder = async (order: Order) => {
    try {
      await api.orders.updateStatus(order.id, 'confirmed');
      loadOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order');
    }
  };

  const handleStartPreparing = async (order: Order) => {
    try {
      await api.orders.updateStatus(order.id, 'preparing');
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const handleMarkReady = async (order: Order) => {
    try {
      await api.orders.updateStatus(order.id, 'ready');
      loadOrders();
      // Play ready notification
      playNotificationSound();
    } catch (error) {
      console.error('Error marking order ready:', error);
      alert('Failed to mark order ready');
    }
  };

  const handleComplete = async (order: Order) => {
    const confirmed = confirm(`Mark Queue #${order.queue_number} as completed?`);
    if (!confirmed) return;

    try {
      await api.orders.updateStatus(order.id, 'completed');
      loadOrders();
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((o) => o.status === status);
  };

  const pendingOrders = getOrdersByStatus('pending');
  const preparingOrders = getOrdersByStatus('preparing').concat(getOrdersByStatus('confirmed'));
  const readyOrders = getOrdersByStatus('ready');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading queue...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage order queue for market mode
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setWalkInDialogOpen(true)} size="lg" className="h-12 text-base">
            ➕ เพิ่มคิวหน้าร้าน
          </Button>
          <Button variant="outline" onClick={loadOrders} size="lg" className="h-12">
            🔄 รีเฟรช
          </Button>
          <Button variant="outline" onClick={() => window.open('/admin/queue/display', '_blank')} size="lg" className="h-12">
            📺 เปิดหน้าจอแสดงคิว
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Preparing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{preparingOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ready for Pickup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{readyOrders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            New Orders ({pendingOrders.length})
          </h2>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl font-bold">
                    Queue #{order.queue_number}
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(order.created_at), 'HH:mm')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id}>
                        {item.quantity}x {item.menu_item_name}
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-muted-foreground">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>

                  <div className="text-xl font-bold">
                    ฿{order.total_amount.toFixed(2)}
                  </div>

                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAcceptOrder(order)}
                    >
                      Accept Order
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingOrders.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No new orders
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Preparing Orders */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            Preparing ({preparingOrders.length})
          </h2>
          <div className="space-y-3">
            {preparingOrders.map((order) => (
              <Card key={order.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl font-bold">
                    Queue #{order.queue_number}
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(order.created_at), 'HH:mm')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id}>
                        {item.quantity}x {item.menu_item_name}
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="text-muted-foreground">
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleStartPreparing(order)}
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleMarkReady(order)}
                      >
                        Mark as Ready
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {preparingOrders.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No orders preparing
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Ready Orders */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            Ready for Pickup ({readyOrders.length})
          </h2>
          <div className="space-y-3">
            {readyOrders.map((order) => (
              <Card key={order.id} className="border-l-4 border-l-green-500 animate-pulse">
                <CardHeader className="pb-3">
                  <CardTitle className="text-3xl font-bold text-green-600">
                    Queue #{order.queue_number}
                  </CardTitle>
                  <CardDescription>
                    Ready at {format(new Date(order.updated_at), 'HH:mm')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.customer_name && (
                    <div className="text-lg font-medium">
                      {order.customer_name}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full"
                      onClick={() => handleComplete(order)}
                    >
                      Complete Pickup
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {readyOrders.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No orders ready
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Queue #{selectedOrder?.queue_number}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && format(new Date(selectedOrder.created_at), 'dd MMM yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={`mt-1 ${statusColors[selectedOrder.status]} text-white`}>
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                </div>

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

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Walk-in Queue Dialog */}
      <Dialog open={walkInDialogOpen} onOpenChange={setWalkInDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">➕ เพิ่มคิวหน้าร้าน</DialogTitle>
            <DialogDescription className="text-base">
              สำหรับลูกค้าที่มาหน้าร้านโดยตรง (ไม่ต้องสั่งอาหาร)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-base font-semibold mb-2 block">
                ชื่อลูกค้า (ไม่บังคับ)
              </label>
              <Input
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                placeholder="คุณ..."
                className="h-12 text-lg"
              />
              <p className="text-sm text-muted-foreground mt-1">
                ไม่ระบุจะใช้ "Walk-in Customer" อัตโนมัติ
              </p>
            </div>

            <div>
              <label className="text-base font-semibold mb-2 block">
                เบอร์โทร (ไม่บังคับ)
              </label>
              <Input
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                placeholder="08x-xxx-xxxx"
                type="tel"
                className="h-12 text-lg"
              />
            </div>

            <div className="p-4 bg-info/10 border border-info rounded-lg">
              <p className="text-sm text-info">
                💡 <strong>เคล็ดลับ:</strong> ใช้สำหรับลูกค้าที่ยืนรอหน้าร้าน หรือลูกค้าที่ต้องการ priority (คนแก่, ผู้พิการ)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setWalkInDialogOpen(false);
                  setWalkInName('');
                  setWalkInPhone('');
                }}
                size="lg"
                className="flex-1 h-12"
                disabled={creatingWalkIn}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleCreateWalkInQueue}
                size="lg"
                className="flex-1 h-12 text-base font-semibold"
                disabled={creatingWalkIn}
              >
                {creatingWalkIn ? 'กำลังเพิ่ม...' : '✅ เพิ่มคิว'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
