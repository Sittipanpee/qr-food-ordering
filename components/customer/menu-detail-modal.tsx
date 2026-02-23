'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/lib/types';
import { Minus, Plus, Clock } from 'lucide-react';
import Image from 'next/image';

interface MenuDetailModalProps {
  menuItem: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (item: MenuItem, quantity: number, notes: string) => void;
}

export function MenuDetailModal({ menuItem, open, onOpenChange, onAddToCart }: MenuDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  if (!menuItem) return null;

  const handleAddToCart = () => {
    onAddToCart(menuItem, quantity, notes);
    setQuantity(1);
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Image */}
        <div className="relative w-full aspect-[16/9] bg-muted">
          {menuItem.image_url ? (
            <Image
              src={menuItem.image_url}
              alt={menuItem.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Title & Price */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">{menuItem.name}</h2>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">฿{menuItem.price}</span>
              {menuItem.preparation_time && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {menuItem.preparation_time} นาที
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {menuItem.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">รายละเอียด</h3>
              <p className="text-muted-foreground leading-relaxed">
                {menuItem.description}
              </p>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">จำนวน</h3>
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-12 p-0"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-5 h-5" />
              </Button>
              <span className="text-2xl font-bold min-w-[3rem] text-center">
                {quantity}
              </span>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-12 p-0"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <h3 className="font-semibold mb-3">หมายเหตุเพิ่มเติม</h3>
            <Input
              placeholder="เช่น ไม่ใส่ผัก, เผ็ดน้อย..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button
            size="lg"
            className="w-full h-14 text-lg"
            onClick={handleAddToCart}
          >
            เพิ่มลงตะกร้า - ฿{menuItem.price * quantity}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
