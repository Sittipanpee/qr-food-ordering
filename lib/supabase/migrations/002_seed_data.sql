-- QR Food Ordering System - Seed Data
-- Created: 2026-02-23

-- ============================================
-- Insert Default Settings
-- ============================================
INSERT INTO settings (
  restaurant_name,
  mode,
  theme,
  currency,
  primary_color,
  service_charge,
  tax_rate,
  enable_queue_system,
  enable_table_ordering,
  auto_print_orders,
  queue_counter,
  estimated_wait_per_queue
) VALUES (
  'ร้านอาหารตัวอย่าง',
  'market',
  'ivory',
  'THB',
  '#FF6B35',
  0.10,
  0.07,
  true,
  true,
  false,
  0,
  5
) ON CONFLICT DO NOTHING;

-- ============================================
-- Insert Default Categories
-- ============================================
INSERT INTO categories (name, description, display_order, is_active) VALUES
  ('อาหารจานหลัก', 'เมนูอาหารจานหลัก', 1, true),
  ('เครื่องดื่ม', 'เครื่องดื่มหลากหลาย', 2, true),
  ('ของหวาน', 'ของหวานน่าทาน', 3, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- Insert Sample Menu Items
-- ============================================
-- Get category IDs first
DO $$
DECLARE
  main_category_id UUID;
  drink_category_id UUID;
  dessert_category_id UUID;
BEGIN
  SELECT id INTO main_category_id FROM categories WHERE name = 'อาหารจานหลัก' LIMIT 1;
  SELECT id INTO drink_category_id FROM categories WHERE name = 'เครื่องดื่ม' LIMIT 1;
  SELECT id INTO dessert_category_id FROM categories WHERE name = 'ของหวาน' LIMIT 1;

  INSERT INTO menu_items (name, description, price, category_id, is_available, preparation_time, display_order) VALUES
    ('ข้าวผัด', 'ข้าวผัดไข่ธรรมดา', 45.00, main_category_id, true, 10, 1),
    ('ผัดกะเพรา', 'ผัดกะเพราหมูสับ', 50.00, main_category_id, true, 15, 2),
    ('ส้มตำ', 'ส้มตำไทย', 40.00, main_category_id, true, 10, 3),
    ('น้ำเปล่า', 'น้ำดื่มบรรจุขวด', 10.00, drink_category_id, true, 1, 1),
    ('น้ำส้ม', 'น้ำส้มคั้นสด', 25.00, drink_category_id, true, 5, 2),
    ('ไอศกรีม', 'ไอศกรีมวานิลลา', 30.00, dessert_category_id, true, 5, 1)
  ON CONFLICT DO NOTHING;
END $$;
