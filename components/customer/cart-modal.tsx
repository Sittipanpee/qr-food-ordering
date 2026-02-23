'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/store/cart-store';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/mock-api';

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'restaurant' | 'market';
  tableNumber?: string;
}

export function CartModal({ open, onOpenChange, mode, tableNumber }: CartModalProps) {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount, getTotalItems } = useCartStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = getTotalAmount();
  const totalItems = getTotalItems();

  const handleQuantityChange = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(menuItemId);
    } else {
      updateQuantity(menuItemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // Market mode requires customer info
    if (mode === 'market' && (!customerName.trim() || !customerPhone.trim())) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get next queue number if market mode
      let queueNumber: number | undefined;
      if (mode === 'market') {
        queueNumber = await api.queue.getNextQueueNumber();
      }

      // Create order
      const orderData = {
        mode,
        table_id: mode === 'restaurant' ? `table-${tableNumber}` : undefined,
        table_number: mode === 'restaurant' ? tableNumber : undefined,
        queue_number: queueNumber,
        customer_name: mode === 'market' ? customerName : undefined,
        customer_phone: mode === 'market' ? customerPhone : undefined,
        status: 'pending' as const,
        items: items.map((item) => ({
          id: `item-${Date.now()}-${Math.random()}`,
          order_id: '',
          menu_item_id: item.menu_item.id,
          menu_item_name: item.menu_item.name,
          quantity: item.quantity,
          price: item.menu_item.price,
          notes: item.notes,
        })),
        total_amount: totalAmount,
        notes,
      };

      const order = await api.orders.create(orderData);

      // Save to localStorage for market mode
      if (mode === 'market' && queueNumber) {
        localStorage.setItem('current_queue', JSON.stringify({
          id: order.id,
          queue_number: queueNumber,
          created_at: order.created_at,
          status: order.status,
        }));

        // Redirect to queue ticket page
        router.push(`/queue/${order.id}`);
      } else {
        // Restaurant mode - show success and clear cart
        alert(`สั่งอาหารสำเร็จ! รหัสออเดอร์: ${order.order_number}`);
        clearCart();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" />
            ตะกร้าสินค้า ({totalItems} รายการ)
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">ตะกร้าว่างเปล่า</p>
              <p className="text-sm text-muted-foreground mt-2">เพิ่มเมนูเพื่อเริ่มสั่งอาหาร</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.menu_item.id} className="flex gap-3 p-3 rounded-lg border border-border hover:border-primary transition-colors">
                  {/* Image */}
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {item.menu_item.image_url ? (
                      <Image
                        src={item.menu_item.image_url}
                        alt={item.menu_item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-1">{item.menu_item.name}</h4>
                    <p className="text-sm text-primary font-semibold mt-1">฿{item.menu_item.price}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleQuantityChange(item.menu_item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleQuantityChange(item.menu_item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.menu_item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">฿{item.menu_item.price * item.quantity}</p>
                  </div>
                </div>
              ))}

              {/* Customer Info (Market Mode Only) */}
              {mode === 'market' && (
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-semibold text-sm">ข้อมูลลูกค้า</h3>
                  <Input
                    placeholder="ชื่อ *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder="เบอร์โทรศัพท์ *"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2 pt-2">
                <Input
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-col gap-3">
            {/* Total */}
            <div className="flex items-center justify-between w-full">
              <span className="text-lg font-semibold">ยอดรวม</span>
              <span className="text-2xl font-bold text-primary">฿{totalAmount}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => clearCart()}
                disabled={isSubmitting}
                className="flex-1"
              >
                ล้างตะกร้า
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="flex-1 text-lg h-12"
              >
                {isSubmitting ? 'กำลังสั่ง...' : mode === 'market' ? 'สั่งและรับคิว' : 'สั่งอาหาร'}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
