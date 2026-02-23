'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/mock-api';
import { Settings } from '@/lib/types';
import { useAuth } from '@/lib/hooks/use-auth';

const navigation = [
  { name: 'หน้าหลัก', href: '/admin', icon: '📊' },
  { name: 'หมวดหมู่', href: '/admin/categories', icon: '📁' },
  { name: 'เมนูอาหาร', href: '/admin/menu', icon: '🍽️' },
  { name: 'โปรโมชั่น', href: '/admin/promotions', icon: '🎁' },
  { name: 'ออเดอร์', href: '/admin/orders', icon: '📋' },
];

const restaurantNav = { name: 'โต๊ะ', href: '/admin/tables', icon: '🪑' };
const marketNav = { name: 'คิว', href: '/admin/queue', icon: '🎫' };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading: authLoading, logout } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);

  // Redirect to login if not authenticated (except for login page)
  useEffect(() => {
    if (!authLoading && !session && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [session, authLoading, pathname, router]);

  useEffect(() => {
    loadSettings();

    // Force light mode
    document.documentElement.classList.remove('dark');
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const navItems = [
    ...navigation,
    settings?.operation_mode === 'restaurant' ? restaurantNav : marketNav,
    { name: 'ตั้งค่า', href: '/admin/settings', icon: '⚙️' },
  ];

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  // Don't show sidebar for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Redirect if not authenticated (handled by useEffect, but this prevents flash)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r flex flex-col">
          {/* Logo/Header */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">
              {settings?.restaurant_name || 'Admin Panel'}
            </h2>
            {settings?.operation_mode && (
              <p className="text-xs text-muted-foreground mt-1">
                {settings.operation_mode === 'restaurant' ? '🍽️ Restaurant' : '🏪 Market'} Mode
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <span className="text-lg">🚪</span>
              <span className="font-medium">ออกจากระบบ</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
