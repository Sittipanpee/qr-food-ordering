'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/mock-api';
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{settings?.restaurant_name || 'Admin Dashboard'}</h1>
          <p className="text-muted-foreground mt-1">
            Overview and management interface
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={settings?.operation_mode === 'restaurant' ? 'default' : 'secondary'}>
            {settings?.operation_mode === 'restaurant' ? 'Restaurant Mode' : 'Market Mode'}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menu Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.menuItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available items
            </p>
          </CardContent>
        </Card>

        {settings?.operation_mode === 'restaurant' ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeTables}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready for orders
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Queues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeQueues}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In queue
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/orders"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold mb-1">Manage Orders</h3>
              <p className="text-sm text-muted-foreground">
                View and update order status
              </p>
            </a>
            <a
              href="/admin/menu"
              className="p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold mb-1">Edit Menu</h3>
              <p className="text-sm text-muted-foreground">
                Add or update menu items
              </p>
            </a>
            {settings?.operation_mode === 'restaurant' ? (
              <a
                href="/admin/tables"
                className="p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <h3 className="font-semibold mb-1">Manage Tables</h3>
                <p className="text-sm text-muted-foreground">
                  Setup tables and QR codes
                </p>
              </a>
            ) : (
              <a
                href="/admin/queue"
                className="p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <h3 className="font-semibold mb-1">Queue Management</h3>
                <p className="text-sm text-muted-foreground">
                  Manage order queues
                </p>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
