'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { api } from '@/lib/api';
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

  const checkExistingQueue = async () => {
    if (mode === 'market') {
      const queueData = localStorage.getItem('current_queue');
      if (queueData) {
        try {
          const queue = JSON.parse(queueData);
          const queueTime = new Date(queue.created_at).getTime();
          const now = Date.now();
          const twoHours = 2 * 60 * 60 * 1000;

          // If queue is less than 2 hours old and not completed
          if (now - queueTime < twoHours && queue.status !== 'completed' && queue.status !== 'cancelled') {
            // Verify queue still exists in API
            try {
              const orderData = await api.orders.getById(queue.id);

              if (orderData) {
                // Queue still exists, ask user
                const shouldContinue = window.confirm(
                  `พบคิว Q${String(queue.queue_number).padStart(3, '0')} ที่ยังไม่เสร็จ\nต้องการติดตามคิวนี้หรือไม่?`
                );
                if (shouldContinue) {
                  window.location.href = `/queue/${queue.id}`;
                } else {
                  // User declined, clear localStorage
                  localStorage.removeItem('current_queue');
                }
              } else {
                // Queue doesn't exist anymore, clear localStorage
                console.log('Queue not found in API, clearing localStorage');
                localStorage.removeItem('current_queue');
              }
            } catch (error) {
              // Error checking queue, clear localStorage
              console.error('Error verifying queue:', error);
              localStorage.removeItem('current_queue');
            }
          } else {
            // Queue is old or completed, clear it
            localStorage.removeItem('current_queue');
          }
        } catch (error) {
          console.error('Error checking queue:', error);
          localStorage.removeItem('current_queue');
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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                {settings?.restaurant_name || 'ร้านอาหาร'}
              </h1>
              {mode === 'restaurant' && tableNumber && (
                <p className="text-xs sm:text-sm text-muted-foreground">โต๊ะ {tableNumber}</p>
              )}
              {mode === 'market' && (
                <p className="text-xs sm:text-sm text-muted-foreground">ตลาดนัด - สั่งและรับคิว</p>
              )}
            </div>
            {settings?.logo_url && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 relative shrink-0 ml-2">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="ค้นหาเมนู..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="sticky top-[120px] sm:top-[136px] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="inline-flex h-auto p-1 gap-1 sm:gap-2 bg-muted/50 w-full overflow-x-auto scrollbar-hide justify-start">
              <TabsTrigger value="all" className="shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap">
                ทั้งหมด
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-32">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-muted-foreground text-base sm:text-lg">ไม่พบเมนูที่ค้นหา</p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="mt-4"
                size="sm"
              >
                ล้างการค้นหา
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const promo = getItemPromotion(item);

              return (
                <div
                  key={item.id}
                  className="card hover:border-primary transition-all duration-200 cursor-pointer group p-3 sm:p-4"
                  onClick={() => handleMenuItemClick(item)}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] mb-2 sm:mb-3 rounded-lg overflow-hidden bg-muted">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <span className="text-xs">No Image</span>
                      </div>
                    )}

                    {/* Promotion Badge */}
                    {promo && (
                      <Badge className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-destructive text-destructive-foreground font-bold shadow-lg text-xs px-1.5 py-0.5">
                        ลด {promo.label}
                      </Badge>
                    )}
                  </div>

                {/* Info */}
                <div className="space-y-1 sm:space-y-2">
                  <h3 className="font-semibold text-sm sm:text-base line-clamp-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 hidden sm:block">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex flex-col">
                      {promo ? (
                        <>
                          <span className="text-[10px] sm:text-xs line-through text-muted-foreground">
                            ฿{item.price}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-destructive">
                            ฿{Math.round(item.price * (1 - promo.discount / 100))}
                          </span>
                        </>
                      ) : (
                        <span className="text-base sm:text-lg font-bold text-primary">
                          ฿{item.price}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full text-base sm:text-lg"
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
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-xl hover:scale-110 transition-transform relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            <Badge
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground animate-pulse text-xs sm:text-sm font-bold"
            >
              {cartItemCount}
            </Badge>
          </Button>
        </div>
      )}

      {/* Hidden Admin Button */}
      <button
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 opacity-10 hover:opacity-30 transition-opacity z-40"
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
