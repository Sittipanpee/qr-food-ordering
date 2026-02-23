'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Settings, Order } from '@/lib/types';

export default function AdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    menuItems: 0,
    activeTables: 0,
    activeQueues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [settingsData, orders, menuItems, tables, queues] = await Promise.all([
        api.settings.get(),
        api.orders.getAll(),
        api.menuItems.getAll(),
        api.tables.getAll(),
        api.queue.getActiveQueue(),
      ]);

      setSettings(settingsData);

      const pendingOrders = orders.filter(
        (o: Order) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing'
      );

      setStats({
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        menuItems: menuItems.length,
        activeTables: tables.filter(t => t.is_active).length,
        activeQueues: queues.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{settings?.restaurant_name || 'Admin'}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            <span className="hidden sm:inline">Overview and management interface</span>
            <span className="sm:hidden">Dashboard</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={settings?.operation_mode === 'restaurant' ? 'default' : 'secondary'} className="text-xs sm:text-sm">
            {settings?.operation_mode === 'restaurant' ? 'Restaurant' : 'Market'}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Menu Items
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold">{stats.menuItems}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Available
            </p>
          </CardContent>
        </Card>

        {settings?.operation_mode === 'restaurant' ? (
          <Card>
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                Active Tables
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold">{stats.activeTables}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Ready
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                Active Queues
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 sm:pb-4">
              <div className="text-2xl sm:text-3xl font-bold">{stats.activeQueues}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                In queue
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <div className="text-2xl sm:text-3xl font-bold">{stats.pendingOrders}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Need action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <a
              href="/admin/orders"
              className="p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="text-sm sm:text-base font-semibold mb-1">Orders</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                View & update status
              </p>
            </a>
            <a
              href="/admin/menu"
              className="p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="text-sm sm:text-base font-semibold mb-1">Menu</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Edit menu items
              </p>
            </a>
            {settings?.operation_mode === 'restaurant' ? (
              <a
                href="/admin/tables"
                className="p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <h3 className="text-sm sm:text-base font-semibold mb-1">Tables</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Setup & QR codes
                </p>
              </a>
            ) : (
              <a
                href="/admin/queue"
                className="p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <h3 className="text-sm sm:text-base font-semibold mb-1">Queue</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Manage queues
                </p>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
