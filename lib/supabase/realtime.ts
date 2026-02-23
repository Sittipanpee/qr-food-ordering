/**
 * Real-time subscriptions for Supabase
 * Handles real-time updates for orders, queue, and other entities
 */

import { supabase } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribe to order updates
 */
export function subscribeToOrders(callback: (payload: any) => void): RealtimeChannel {
  return supabase
    .channel('orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to order items updates
 */
export function subscribeToOrderItems(callback: (payload: any) => void): RealtimeChannel {
  return supabase
    .channel('order_items')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'order_items',
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to menu items updates
 */
export function subscribeToMenuItems(callback: (payload: any) => void): RealtimeChannel {
  return supabase
    .channel('menu_items')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'menu_items',
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to queue updates (market mode)
 */
export function subscribeToQueue(callback: (payload: any) => void): RealtimeChannel {
  return supabase
    .channel('queue')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: "mode=eq.market",
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to settings updates
 */
export function subscribeToSettings(callback: (payload: any) => void): RealtimeChannel {
  return supabase
    .channel('settings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'settings',
      },
      callback
    )
    .subscribe();
}

/**
 * Unsubscribe from all channels
 */
export async function unsubscribeAll() {
  const channels = supabase.getChannels();
  for (const channel of channels) {
    await supabase.removeChannel(channel);
  }
}
