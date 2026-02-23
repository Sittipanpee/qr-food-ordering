'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { Promotion } from '@/lib/types';
import { format } from 'date-fns';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [minimumOrder, setMinimumOrder] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const data = await api.promotions.getAll();
      setPromotions(data);
    } catch (error) {
      console.error('Error loading promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      // Edit mode
      setEditingPromotion(promotion);
      setName(promotion.name);
      setDescription(promotion.description || '');
      setDiscountType(promotion.discount_type);
      setDiscountValue(promotion.discount_value);
      setMinimumOrder(promotion.minimum_order || 0);
      setStartDate(promotion.start_date.split('T')[0]);
      setEndDate(promotion.end_date.split('T')[0]);
      setIsActive(promotion.is_active);
    } else {
      // Create mode
      setEditingPromotion(null);
      setName('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue(10);
      setMinimumOrder(0);
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
      setIsActive(true);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPromotion(null);
    setName('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue(0);
    setMinimumOrder(0);
    setStartDate('');
    setEndDate('');
    setIsActive(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter promotion name');
      return;
    }

    if (discountValue <= 0) {
      alert('Please enter a valid discount value');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('End date must be after start date');
      return;
    }

    try {
      const data = {
        name: name.trim(),
        description: description.trim() || undefined,
        discount_type: discountType,
        discount_value: discountValue,
        minimum_order: minimumOrder > 0 ? minimumOrder : undefined,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        is_active: isActive,
      };

      if (editingPromotion) {
        await api.promotions.update(editingPromotion.id, data);
      } else {
        await api.promotions.create(data);
      }

      handleCloseDialog();
      loadPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      alert('Failed to save promotion');
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    const confirmed = confirm(
      `Delete promotion "${promotion.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.promotions.delete(promotion.id);
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert('Failed to delete promotion');
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      await api.promotions.update(promotion.id, {
        is_active: !promotion.is_active,
      });
      loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion status:', error);
    }
  };

  const isPromotionActive = (promotion: Promotion) => {
    if (!promotion.is_active) return false;
    const now = new Date();
    const start = new Date(promotion.start_date);
    const end = new Date(promotion.end_date);
    return now >= start && now <= end;
  };

  const getPromotionStatus = (promotion: Promotion) => {
    if (!promotion.is_active) return { label: 'Inactive', variant: 'secondary' as const };

    const now = new Date();
    const start = new Date(promotion.start_date);
    const end = new Date(promotion.end_date);

    if (now < start) return { label: 'Scheduled', variant: 'outline' as const };
    if (now > end) return { label: 'Expired', variant: 'secondary' as const };
    return { label: 'Active', variant: 'default' as const };
  };

  const formatDiscount = (promotion: Promotion) => {
    if (promotion.discount_type === 'percentage') {
      return `${promotion.discount_value}% OFF`;
    }
    return `฿${promotion.discount_value} OFF`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading promotions...</p>
      </div>
    );
  }

  const activePromotions = promotions.filter(isPromotionActive);
  const scheduledPromotions = promotions.filter(
    (p) => p.is_active && new Date(p.start_date) > new Date()
  );
  const expiredPromotions = promotions.filter(
    (p) => new Date(p.end_date) < new Date()
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage promotional discounts
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              + Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? 'Edit Promotion' : 'Add New Promotion'}
              </DialogTitle>
              <DialogDescription>
                {editingPromotion
                  ? 'Update promotion details'
                  : 'Create a new promotional offer'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Promotion Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Summer Sale"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type">Discount Type *</Label>
                  <select
                    id="discount_type"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (฿)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="discount_value">
                    Discount Value * {discountType === 'percentage' ? '(%)' : '(THB)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    min="0"
                    max={discountType === 'percentage' ? 100 : undefined}
                    step={discountType === 'percentage' ? 1 : 0.01}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="minimum_order">Minimum Order (THB)</Label>
                <Input
                  id="minimum_order"
                  type="number"
                  min="0"
                  step="0.01"
                  value={minimumOrder}
                  onChange={(e) => setMinimumOrder(parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave 0 for no minimum
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingPromotion ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Promotions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{promotions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activePromotions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scheduledPromotions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{expiredPromotions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions List */}
      {promotions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No promotions yet</p>
            <Button onClick={() => handleOpenDialog()}>
              Create Your First Promotion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promotion) => {
            const status = getPromotionStatus(promotion);
            return (
              <Card key={promotion.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {promotion.name}
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </CardTitle>
                      {promotion.description && (
                        <CardDescription className="mt-1">
                          {promotion.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center py-4 bg-muted rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {formatDiscount(promotion)}
                      </div>
                      {promotion.minimum_order && promotion.minimum_order > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Min. order: ฿{promotion.minimum_order}
                        </p>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Start:</span>
                        <span>{format(new Date(promotion.start_date), 'dd MMM yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End:</span>
                        <span>{format(new Date(promotion.end_date), 'dd MMM yyyy')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(promotion)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={promotion.is_active ? 'outline' : 'default'}
                        onClick={() => handleToggleActive(promotion)}
                      >
                        {promotion.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(promotion)}
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
