-- Fix RLS Policies for Public Access
-- Settings should be publicly readable

-- Add public read policy for settings
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Add public read/write policies for orders (customers need to create orders)
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update orders" ON orders FOR UPDATE USING (true);

-- Add public read/write policies for order_items
CREATE POLICY "Public read order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Public create order_items" ON order_items FOR INSERT WITH CHECK (true);
