/**
 * Supabase API wrapper
 * Provides same interface as mock API for easy migration
 */

import { supabaseServer } from '../server';
import { supabase } from '../client';
import type { Category, MenuItem, Order, OrderStatus, Promotion, Settings, Table } from '@/lib/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const supabaseAPI = {
  /**
   * Settings API
   */
  settings: {
    get: async (): Promise<Settings> => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as Settings;
    },

    update: async (updates: Partial<Settings>): Promise<Settings> => {
      const { data, error } = await supabaseServer
        .from('settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (await supabase.from('settings').select('id').single()).data?.id)
        .select()
        .single();

      if (error) throw error;
      return data as Settings;
    },
  },

  /**
   * Categories API
   */
  categories: {
    getAll: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data as Category[];
    },

    getById: async (id: string): Promise<Category | null> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Category) || null;
    },

    create: async (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
      const { data: result, error } = await supabaseServer
        .from('categories')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result as Category;
    },

    update: async (id: string, updates: Partial<Category>): Promise<Category | null> => {
      const { data, error } = await supabaseServer
        .from('categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Category) || null;
    },

    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabaseServer
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },
  },

  /**
   * Menu Items API
   */
  menuItems: {
    getAll: async (): Promise<MenuItem[]> => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('display_order');

      if (error) throw error;
      return data as MenuItem[];
    },

    getById: async (id: string): Promise<MenuItem | null> => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as MenuItem) || null;
    },

    getByCategoryId: async (categoryId: string): Promise<MenuItem[]> => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_available', true)
        .order('display_order');

      if (error) throw error;
      return data as MenuItem[];
    },

    create: async (data: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> => {
      const { data: result, error } = await supabaseServer
        .from('menu_items')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result as MenuItem;
    },

    update: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
      const { data, error } = await supabaseServer
        .from('menu_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as MenuItem) || null;
    },

    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabaseServer
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },
  },

  /**
   * Promotions API
   */
  promotions: {
    getAll: async (): Promise<Promotion[]> => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },

    getActive: async (): Promise<Promotion[]> => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Promotion[];
    },

    getById: async (id: string): Promise<Promotion | null> => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Promotion) || null;
    },

    create: async (data: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>): Promise<Promotion> => {
      const { data: result, error } = await supabaseServer
        .from('promotions')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result as Promotion;
    },

    update: async (id: string, updates: Partial<Promotion>): Promise<Promotion | null> => {
      const { data, error } = await supabaseServer
        .from('promotions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Promotion) || null;
    },

    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabaseServer
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },
  },

  /**
   * Tables API
   */
  tables: {
    getAll: async (): Promise<Table[]> => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('is_active', true)
        .order('table_number');

      if (error) throw error;
      return data as Table[];
    },

    getById: async (id: string): Promise<Table | null> => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Table) || null;
    },

    getByTableNumber: async (tableNumber: string): Promise<Table | null> => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('table_number', tableNumber)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Table) || null;
    },

    create: async (data: Omit<Table, 'id' | 'created_at' | 'updated_at'>): Promise<Table> => {
      const { data: result, error } = await supabaseServer
        .from('tables')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result as Table;
    },

    update: async (id: string, updates: Partial<Table>): Promise<Table | null> => {
      const { data, error } = await supabaseServer
        .from('tables')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Table) || null;
    },

    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabaseServer
        .from('tables')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },
  },

  /**
   * Orders API
   */
  orders: {
    getAll: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },

    getById: async (id: string): Promise<Order | null> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Order) || null;
    },

    getByStatus: async (status: OrderStatus): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },

    getByTableId: async (tableId: string): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('table_id', tableId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },

    create: async (data: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> => {
      const { count } = await supabase.from('orders').select('*', { count: 'exact' });
      const orderNumber = `#${String((count || 0) + 1).padStart(3, '0')}`;

      const { data: result, error } = await supabaseServer
        .from('orders')
        .insert([{ ...data, order_number: orderNumber }])
        .select()
        .single();

      if (error) throw error;
      return result as Order;
    },

    updateStatus: async (id: string, status: OrderStatus): Promise<Order | null> => {
      const { data, error } = await supabaseServer
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Order) || null;
    },

    delete: async (id: string): Promise<boolean> => {
      const { error } = await supabaseServer
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    },
  },

  /**
   * Queue API
   */
  queue: {
    getNextQueueNumber: async (): Promise<number> => {
      const { data } = await supabase.from('settings').select('queue_counter').single();
      const nextNumber = (data?.queue_counter || 0) + 1;

      await supabaseServer.from('settings').update({ queue_counter: nextNumber }).single();

      return nextNumber;
    },

    getQueueByNumber: async (queueNumber: number): Promise<Order | null> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('queue_number', queueNumber)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as Order) || null;
    },

    getAllQueue: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('mode', 'market')
        .not('queue_number', 'is', null)
        .order('queue_number');

      if (error) throw error;
      return data as Order[];
    },

    getActiveQueue: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('mode', 'market')
        .not('queue_number', 'is', null)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('queue_number');

      if (error) throw error;
      return data as Order[];
    },
  },
};

export default supabaseAPI;
