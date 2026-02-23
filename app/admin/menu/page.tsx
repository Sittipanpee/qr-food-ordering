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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { MenuItem, Category } from '@/lib/types';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [preparationTime, setPreparationTime] = useState(0);
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        api.menuItems.getAll(),
        api.categories.getAll(),
      ]);

      const sorted = itemsData.sort((a, b) => a.display_order - b.display_order);
      setMenuItems(sorted);
      setCategories(categoriesData.filter((c) => c.is_active));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      // Edit mode
      setEditingItem(item);
      setName(item.name);
      setDescription(item.description || '');
      setPrice(item.price);
      setCategoryId(item.category_id);
      setImageUrl(item.image_url || '');
      setIsAvailable(item.is_available);
      setPreparationTime(item.preparation_time || 0);
      setDisplayOrder(item.display_order);
    } else {
      // Create mode
      setEditingItem(null);
      setName('');
      setDescription('');
      setPrice(0);
      setCategoryId(categories[0]?.id || '');
      setImageUrl('');
      setIsAvailable(true);
      setPreparationTime(10);
      setDisplayOrder(menuItems.length);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice(0);
    setCategoryId('');
    setImageUrl('');
    setIsAvailable(true);
    setPreparationTime(0);
    setDisplayOrder(0);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter item name');
      return;
    }

    if (!categoryId) {
      alert('Please select a category');
      return;
    }

    if (price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        await api.menuItems.update(editingItem.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          price,
          category_id: categoryId,
          image_url: imageUrl || undefined,
          is_available: isAvailable,
          preparation_time: preparationTime || undefined,
          display_order: displayOrder,
        });
      } else {
        // Create new item
        await api.menuItems.create({
          name: name.trim(),
          description: description.trim() || undefined,
          price,
          category_id: categoryId,
          image_url: imageUrl || undefined,
          is_available: isAvailable,
          preparation_time: preparationTime || undefined,
          display_order: displayOrder,
        });
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const handleDelete = async (item: MenuItem) => {
    const confirmed = confirm(
      `Delete "${item.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.menuItems.delete(item.id);
      loadData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await api.menuItems.update(item.id, {
        is_available: !item.is_available,
      });
      loadData();
    } catch (error) {
      console.error('Error toggling item availability:', error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category_id === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Add and manage your menu items
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              + Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? 'Update menu item information'
                  : 'Create a new item for your menu'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Pad Thai"
                    className="mt-1"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (THB) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter image URL or leave blank
                  </p>
                </div>

                <div>
                  <Label htmlFor="prep_time">Preparation Time (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    min="0"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    min="0"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div className="col-span-2 flex items-center justify-between py-2">
                  <Label htmlFor="is_available">Available for Order</Label>
                  <Switch
                    id="is_available"
                    checked={isAvailable}
                    onCheckedChange={setIsAvailable}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Items ({menuItems.length})</TabsTrigger>
          {categories.map((cat) => {
            const count = menuItems.filter((item) => item.category_id === cat.id).length;
            return (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              {selectedCategory === 'all' ? 'No menu items yet' : 'No items in this category'}
            </p>
            <Button onClick={() => handleOpenDialog()}>
              Add Your First Menu Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id}>
              {item.image_url && (
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {item.name}
                      {!item.is_available && (
                        <Badge variant="secondary">Unavailable</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {getCategoryName(item.category_id)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold">฿{item.price.toFixed(2)}</span>
                  {item.preparation_time && (
                    <span className="text-sm text-muted-foreground">
                      ⏱️ {item.preparation_time} min
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(item)}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant={item.is_available ? 'outline' : 'default'}
                    onClick={() => handleToggleAvailable(item)}
                  >
                    {item.is_available ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item)}
                    className="text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Menu Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{menuItems.length}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {menuItems.filter((i) => i.is_available).length}
              </p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                ฿{menuItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
