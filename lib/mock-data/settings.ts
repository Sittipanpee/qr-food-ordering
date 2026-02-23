import { Settings } from '../types';

export const mockSettings: Settings = {
  id: 'settings-1',
  restaurant_name: 'QR Food Ordering Demo',
  restaurant_description: 'ร้านอาหารไทยต้นตำรับ บริการด้วยใจ อาหารอร่อย สะอาด ปลอดภัย',
  logo_url: '/logo.png',
  primary_color: '#FF6B35',
  operation_mode: 'restaurant',
  currency: 'THB',
  tax_rate: 0.07,
  service_charge_rate: 0.1,
  enable_queue_system: true,
  enable_table_ordering: true,
  auto_print_orders: false,
  estimated_wait_per_queue: 5, // เวลารอโดยประมาณต่อคิว (นาที)
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-02-23T00:00:00Z',
};
