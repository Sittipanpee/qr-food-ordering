'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { api } from '@/lib/mock-api';
import { Category, MenuItem, Settings } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import Image from 'next/image';
import { CartModal } from '@/components/customer/cart-modal';
import { MenuDetailModal } from '@/components/customer/menu-detail-modal';
import { Promotion } from '@/lib/types';

function MenuContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get('table');
  const mode = searchParams.get('mode') || (tableNumber ? 'restaurant' : 'market');

  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { items, getTotalItems, addItem } = useCartStore();
  const cartItemCount = getTotalItems();

  useEffect(() => {
    loadData();
    checkExistingQueue();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [settingsData, categoriesData, menuItemsData, promotionsData] = await Promise.all([
        api.settings.get(),
        api.categories.getAll(),
        api.menuItems.getAll(),
        api.promotions.getActive(),
      ]);
      setSettings(settingsData);
      setCategories(categoriesData.filter(c => c.is_active));
      setMenuItems(menuItemsData.filter(m => m.is_available));
      setPromotions(promotionsData);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingQueue = () => {
    if (mode === 'market') {
      const queueData = localStorage.getItem('current_queue');
      if (queueData) {
        try {
          const queue = JSON.parse(queueData);
          const queueTime = new Date(queue.created_at).getTime();
          const now = Date.now();
          const twoHours = 2 * 60 * 60 * 1000;

          // If queue is less than 2 hours old and not completed
          if (now - queueTime < twoHours && queue.status !== 'completed') {
            const shouldContinue = window.confirm(
              `พบคิว Q${String(queue.queue_number).padStart(3, '0')} ที่ยังไม่เสร็จ\nต้องการติดตามคิวนี้หรือไม่?`
            );
            if (shouldContinue) {
              window.location.href = `/queue/${queue.id}`;
            }
          }
        } catch (error) {
          console.error('Error checking queue:', error);
        }
      }
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (menuItem: MenuItem, quantity: number = 1, notes: string = '') => {
    addItem(menuItem, quantity, notes);
  };

  const handleMenuItemClick = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setIsDetailOpen(true);
  };

  const getItemPromotion = (item: MenuItem) => {
    // Simple promo logic - in real app, this would be more sophisticated
    const promo = promotions.find(p => p.is_active);
    if (promo && promo.discount_type === 'percentage') {
      return {
        discount: promo.discount_value,
        label: `${promo.discount_value}%`
      };
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดเมนู...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {settings?.restaurant_name || 'ร้านอาหาร'}
              </h1>
              {mode === 'restaurant' && tableNumber && (
                <p className="text-sm text-muted-foreground">โต๊ะ {tableNumber}</p>
              )}
              {mode === 'market' && (
                <p className="text-sm text-muted-foreground">ตลาดนัด - สั่งและรับคิว</p>
              )}
            </div>
            {settings?.logo_url && (
              <div className="w-12 h-12 relative shrink-0">
                <Image
                  src={settings.logo_url}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="ค้นหาเมนู..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="sticky top-[144px] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="inline-flex h-auto p-1 gap-2 bg-muted/50 w-full overflow-x-auto scrollbar-hide justify-start">
              <TabsTrigger value="all" className="shrink-0 px-4 py-2">
                ทั้งหมด
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="shrink-0 px-4 py-2">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="container mx-auto px-4 py-6 pb-32">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">ไม่พบเมนูที่ค้นหา</p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                ล้างการค้นหา
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const promo = getItemPromotion(item);

              return (
                <div
                  key={item.id}
                  className="card hover:border-primary transition-all duration-200 cursor-pointer group"
                  onClick={() => handleMenuItemClick(item)}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] mb-3 rounded-lg overflow-hidden bg-muted">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <span className="text-xs">No Image</span>
                      </div>
                    )}

                    {/* Promotion Badge */}
                    {promo && (
                      <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground font-bold shadow-lg">
                        ลด {promo.label}
                      </Badge>
                    )}
                  </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-base line-clamp-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                      {promo ? (
                        <>
                          <span className="text-xs line-through text-muted-foreground">
                            ฿{item.price}
                          </span>
                          <span className="text-lg font-bold text-destructive">
                            ฿{Math.round(item.price * (1 - promo.discount / 100))}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          ฿{item.price}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 shadow-xl hover:scale-110 transition-transform relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-6 h-6" />
            <Badge
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground animate-pulse"
            >
              {cartItemCount}
            </Badge>
          </Button>
        </div>
      )}

      {/* Hidden Admin Button */}
      <button
        className="fixed bottom-6 left-6 w-12 h-12 opacity-10 hover:opacity-30 transition-opacity z-40"
        onMouseDown={(e) => {
          const timer = setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);

          const handleMouseUp = () => {
            clearTimeout(timer);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseUp);
          };

          document.addEventListener('mouseup', handleMouseUp);
          document.addEventListener('mouseleave', handleMouseUp);
        }}
        aria-label="Admin access"
      >
        <div className="w-full h-full rounded-full bg-muted"></div>
      </button>

      {/* Menu Detail Modal */}
      <MenuDetailModal
        menuItem={selectedMenuItem}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Modal */}
      <CartModal
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        mode={mode as 'restaurant' | 'market'}
        tableNumber={tableNumber || undefined}
      />
    </div>
  );
}

export default function CustomerMenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดเมนู...</p>
        </div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
