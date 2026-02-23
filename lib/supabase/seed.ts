/**
 * Seed script to populate Supabase with mock data
 * Usage: npx ts-node lib/supabase/seed.ts
 */

import { supabaseServer } from './server';
import {
  mockSettings,
  mockCategories,
  mockMenuItems,
  mockPromotions,
  mockTables,
  mockOrders,
} from '../mock-data';

async function seed() {
  try {
    console.log('🌱 Starting seed process...');

    // 1. Clear existing data (optional - comment out for safety)
    console.log('Clearing existing data...');
    // await supabaseServer.from('order_items').delete().neq('id', 'null');
    // await supabaseServer.from('orders').delete().neq('id', 'null');
    // await supabaseServer.from('menu_items').delete().neq('id', 'null');
    // await supabaseServer.from('categories').delete().neq('id', 'null');
    // await supabaseServer.from('promotions').delete().neq('id', 'null');
    // await supabaseServer.from('tables').delete().neq('id', 'null');
    // await supabaseServer.from('settings').delete().neq('id', 'null');

    // 2. Insert Settings
    console.log('📋 Inserting settings...');
    const settingsData = {
      restaurant_name: mockSettings.restaurant_name,
      logo_url: mockSettings.logo_url,
      mode: mockSettings.operation_mode,
      theme: mockSettings.primary_color,
      currency: mockSettings.currency,
      service_charge: mockSettings.service_charge_rate,
      tax_rate: mockSettings.tax_rate,
      enable_queue_system: mockSettings.enable_queue_system,
      enable_table_ordering: mockSettings.enable_table_ordering,
      auto_print_orders: mockSettings.auto_print_orders,
    };

    const { data: settings, error: settingsError } = await supabaseServer
      .from('settings')
      .insert([settingsData])
      .select();

    if (settingsError) {
      console.error('❌ Error inserting settings:', settingsError);
      throw settingsError;
    }
    console.log('✅ Settings inserted');

    // 3. Insert Categories
    console.log('📂 Inserting categories...');
    const categoriesData = mockCategories.map((cat: any) => ({
      name: cat.name,
      description: cat.description,
      display_order: cat.display_order,
      is_active: cat.is_active,
    }));

    const { data: categories, error: categoriesError } = await supabaseServer
      .from('categories')
      .insert(categoriesData)
      .select();

    if (categoriesError) {
      console.error('❌ Error inserting categories:', categoriesError);
      throw categoriesError;
    }
    console.log(`✅ ${categories?.length} categories inserted`);

    // 4. Insert Menu Items
    console.log('🍽️  Inserting menu items...');
    const menuItemsData = mockMenuItems.map((item: any) => {
      // Map old IDs to new category IDs
      const categoryMap: any = {
        'cat-1': 'cat-001',
        'cat-2': 'cat-002',
        'cat-3': 'cat-003',
        'cat-4': 'cat-004',
        'cat-101': 'cat-101',
        'cat-102': 'cat-102',
        'cat-103': 'cat-103',
        'cat-104': 'cat-104',
        'cat-105': 'cat-105',
        'cat-301': 'cat-301',
        'cat-302': 'cat-302',
        'cat-303': 'cat-303',
      };

      return {
        name: item.name,
        description: item.description,
        price: item.price,
        category_id: categories?.find(
          (c: any) => c.name === mockCategories.find((mc: any) => mc.id === item.category_id)?.name
        )?.id,
        image_url: item.image_url,
        is_available: item.is_available,
        preparation_time: item.preparation_time,
        display_order: item.display_order,
      };
    });

    const { data: menuItems, error: menuItemsError } = await supabaseServer
      .from('menu_items')
      .insert(menuItemsData)
      .select();

    if (menuItemsError) {
      console.error('❌ Error inserting menu items:', menuItemsError);
      throw menuItemsError;
    }
    console.log(`✅ ${menuItems?.length} menu items inserted`);

    // 5. Insert Promotions
    console.log('🎉 Inserting promotions...');
    const promotionsData = mockPromotions.map((promo: any) => ({
      name: promo.name,
      description: promo.description,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      minimum_order: promo.minimum_order,
      start_date: promo.start_date,
      end_date: promo.end_date,
      is_active: promo.is_active,
    }));

    const { data: promotions, error: promotionsError } = await supabaseServer
      .from('promotions')
      .insert(promotionsData)
      .select();

    if (promotionsError) {
      console.error('❌ Error inserting promotions:', promotionsError);
      throw promotionsError;
    }
    console.log(`✅ ${promotions?.length} promotions inserted`);

    // 6. Insert Tables
    console.log('🪑 Inserting tables...');
    const tablesData = mockTables.map((table: any) => ({
      table_number: table.table_number,
      qr_code: table.qr_code || `qr_${table.table_number}`,
      is_active: table.is_active,
    }));

    const { data: tables, error: tablesError } = await supabaseServer
      .from('tables')
      .insert(tablesData)
      .select();

    if (tablesError) {
      console.error('❌ Error inserting tables:', tablesError);
      throw tablesError;
    }
    console.log(`✅ ${tables?.length} tables inserted`);

    // 7. Insert Orders
    console.log('📦 Inserting orders...');
    const ordersData = mockOrders.map((order: any) => ({
      order_number: order.order_number,
      mode: order.mode,
      table_id: tables?.find((t: any) => t.table_number === order.table_number)?.id,
      table_number: order.table_number,
      queue_number: order.queue_number,
      tracking_url: order.tracking_url,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      status: order.status,
      total_amount: order.total_amount,
      notes: order.notes,
    }));

    const { data: orders, error: ordersError } = await supabaseServer
      .from('orders')
      .insert(ordersData)
      .select();

    if (ordersError) {
      console.error('❌ Error inserting orders:', ordersError);
      throw ordersError;
    }
    console.log(`✅ ${orders?.length} orders inserted`);

    // 8. Insert Order Items
    console.log('🛒 Inserting order items...');
    const orderItemsData: any[] = [];

    mockOrders.forEach((order: any) => {
      const dbOrder = orders?.find((o: any) => o.order_number === order.order_number);
      if (dbOrder && order.items) {
        order.items.forEach((item: any) => {
          const menuItem = menuItems?.find((mi: any) => mi.name === item.menu_item_name);
          orderItemsData.push({
            order_id: dbOrder.id,
            menu_item_id: menuItem?.id,
            menu_item_name: item.menu_item_name,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
          });
        });
      }
    });

    const { data: orderItems, error: orderItemsError } = await supabaseServer
      .from('order_items')
      .insert(orderItemsData)
      .select();

    if (orderItemsError) {
      console.error('❌ Error inserting order items:', orderItemsError);
      throw orderItemsError;
    }
    console.log(`✅ ${orderItems?.length} order items inserted`);

    console.log('\n✅ ✅ ✅ SEED COMPLETED SUCCESSFULLY! ✅ ✅ ✅\n');
    console.log('📊 Summary:');
    console.log(`  - Settings: 1`);
    console.log(`  - Categories: ${categories?.length}`);
    console.log(`  - Menu Items: ${menuItems?.length}`);
    console.log(`  - Promotions: ${promotions?.length}`);
    console.log(`  - Tables: ${tables?.length}`);
    console.log(`  - Orders: ${orders?.length}`);
    console.log(`  - Order Items: ${orderItems?.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ SEED FAILED:', error);
    process.exit(1);
  }
}

seed();
