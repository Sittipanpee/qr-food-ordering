// Type definitions for the application

export type OperationMode = 'restaurant' | 'market';

export interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  preparation_time?: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  table_number: string;
  qr_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  table_id?: string;
  table_number?: string;
  customer_name?: string;
  customer_phone?: string;
  status: OrderStatus;
  items: OrderItem[];
  total_amount: number;
  notes?: string;
  mode: OperationMode;
  queue_number?: number;
  tracking_url?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'      // รอยืนยัน
  | 'confirmed'    // ยืนยันแล้ว
  | 'preparing'    // กำลังเตรียม
  | 'ready'        // พร้อมเสิร์ฟ/รับ
  | 'completed'    // เสร็จสิ้น
  | 'cancelled';   // ยกเลิก

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Settings {
  id: string;
  restaurant_name: string;
  restaurant_description?: string; // คำอธิบายร้าน
  logo_url?: string;
  primary_color: string;
  operation_mode: OperationMode;
  currency: string;
  tax_rate: number;
  service_charge_rate: number;
  enable_queue_system: boolean;
  enable_table_ordering: boolean;
  auto_print_orders: boolean;
  estimated_wait_per_queue: number; // เวลารอโดยประมาณต่อคิว (นาที)
  created_at: string;
  updated_at: string;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
