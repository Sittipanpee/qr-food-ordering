'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/mock-api';
import { Settings, OperationMode } from '@/lib/types';
import {
  generateQRCode,
  downloadQRCode,
  downloadQRCodePDF,
} from '@/lib/utils/qr-generator';
import { testNotification } from '@/lib/utils/notifications';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantDescription, setRestaurantDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#8B4513');
  const [currency, setCurrency] = useState('THB');
  const [taxRate, setTaxRate] = useState(0);
  const [serviceChargeRate, setServiceChargeRate] = useState(0);
  const [operationMode, setOperationMode] = useState<OperationMode>('restaurant');
  const [estimatedWaitPerQueue, setEstimatedWaitPerQueue] = useState(5);

  // QR Code states
  const [marketQR, setMarketQR] = useState<string>('');
  const [generatingQR, setGeneratingQR] = useState(false);

  useEffect(() => {
    loadSettings();
    generateMarketQR();
  }, []);

  const generateMarketQR = async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const marketUrl = `${baseUrl}/menu?mode=market`;
      const qrDataUrl = await generateQRCode(marketUrl, { width: 400 });
      setMarketQR(qrDataUrl);
    } catch (error) {
      console.error('Error generating market QR code:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      setSettings(data);

      // Populate form
      setRestaurantName(data.restaurant_name);
      setRestaurantDescription(data.restaurant_description || '');
      setLogoUrl(data.logo_url || '');
      setPrimaryColor(data.primary_color);
      setCurrency(data.currency);
      setTaxRate(data.tax_rate);
      setServiceChargeRate(data.service_charge_rate);
      setOperationMode(data.operation_mode);
      setEstimatedWaitPerQueue(data.estimated_wait_per_queue);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updated = await api.settings.update({
        restaurant_name: restaurantName,
        restaurant_description: restaurantDescription,
        logo_url: logoUrl,
        primary_color: primaryColor,
        currency,
        tax_rate: taxRate,
        service_charge_rate: serviceChargeRate,
        operation_mode: operationMode,
        estimated_wait_per_queue: estimatedWaitPerQueue,
      });
      setSettings(updated);
      alert('บันทึกการตั้งค่าเรียบร้อยแล้ว!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setSaving(false);
    }
  };

  const handleModeSwitch = async (newMode: OperationMode) => {
    const confirmed = confirm(
      `Switch to ${newMode === 'restaurant' ? 'Restaurant' : 'Market'} Mode?\n\n` +
      `This will change the operation mode of your system.`
    );

    if (!confirmed) return;

    setOperationMode(newMode);
  };

  const handleDownloadMarketQR = async (format: 'png' | 'pdf') => {
    if (!marketQR) return;

    setGeneratingQR(true);
    try {
      const filename = `Market-Mode-QR-${restaurantName.replace(/\s+/g, '-')}`;

      if (format === 'png') {
        downloadQRCode(marketQR, filename);
      } else if (format === 'pdf') {
        await downloadQRCodePDF(marketQR, filename, {
          title: `${restaurantName} - Market Mode`,
          subtitle: 'Scan to order (Market Mode)',
        });
      }
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('ไม่สามารถดาวน์โหลด QR Code ได้');
    } finally {
      setGeneratingQR(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">⚙️ ตั้งค่าระบบ</h1>
        <p className="text-muted-foreground mt-1">
          จัดการการตั้งค่าร้านอาหารและระบบ
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="h-12">
          <TabsTrigger value="general" className="text-base">ทั่วไป</TabsTrigger>
          <TabsTrigger value="mode" className="text-base">โหมดการทำงาน</TabsTrigger>
          <TabsTrigger value="pricing" className="text-base">ราคา</TabsTrigger>
          <TabsTrigger value="qrcodes" className="text-base">QR Codes</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">ข้อมูลร้าน</CardTitle>
              <CardDescription className="text-base">
                ตั้งค่าข้อมูลพื้นฐานของร้านอาหาร
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-base font-semibold mb-2 block">
                  🏪 ชื่อร้าน
                </label>
                <Input
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="เช่น ร้านส้มตำป้าแดง"
                  className="h-12 text-lg"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  ชื่อนี้จะแสดงบนหน้าเมนูและเอกสารต่างๆ
                </p>
              </div>

              <div>
                <label className="text-base font-semibold mb-2 block">
                  📝 คำอธิบายร้าน
                </label>
                <textarea
                  value={restaurantDescription}
                  onChange={(e) => setRestaurantDescription(e.target.value)}
                  placeholder="เช่น ร้านอาหารไทยต้นตำรับ บริการด้วยใจ อาหารอร่อย สะอาด ปลอดภัย"
                  className="w-full h-24 px-4 py-3 text-base border-2 border-border rounded-xl resize-none focus:outline-none focus:border-primary"
                  maxLength={200}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  คำอธิบายสั้นๆ เกี่ยวกับร้านของคุณ (สูงสุด 200 ตัวอักษร)
                </p>
              </div>

              <div>
                <label className="text-base font-semibold mb-2 block">
                  🖼️ ลิงก์โลโก้ร้าน
                </label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png หรือ /logo.png"
                  className="h-12 text-base"
                  type="url"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  URL ของโลโก้ร้าน (ควรเป็นไฟล์ PNG หรือ JPG ขนาดไม่เกิน 200KB)
                </p>
                {logoUrl && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">ตัวอย่างโลโก้:</p>
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="h-16 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <label className="text-base font-semibold mb-2 block">
                  🎨 สีหลักของร้าน
                </label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-12"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#FF6B35"
                    className="h-12"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  สีนี้จะใช้สำหรับปุ่มและองค์ประกอบสำคัญในระบบ
                </p>
              </div>

              <div>
                <label className="text-base font-semibold mb-2 block">
                  💰 สกุลเงิน
                </label>
                <Input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="THB"
                  className="h-12"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  รหัสสกุลเงิน (เช่น THB, USD, EUR)
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  size="lg"
                  className="h-12 text-base w-full md:w-auto"
                >
                  {saving ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">🔔 การแจ้งเตือน</CardTitle>
              <CardDescription className="text-base">
                ตั้งค่าการแจ้งเตือนสำหรับออเดอร์ใหม่และการอัพเดทสถานะ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-semibold">💡 คุณสมบัติการแจ้งเตือน</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✅</span>
                    <span>
                      <strong>แจ้งเตือนออเดอร์ใหม่:</strong> เล่นเสียงเมื่อมีออเดอร์เข้ามาใหม่ในหน้า Orders
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✅</span>
                    <span>
                      <strong>แจ้งเตือนลูกค้า:</strong> ส่งการแจ้งเตือนไปยังมือถือลูกค้าเมื่อออเดอร์พร้อม
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✅</span>
                    <span>
                      <strong>เปิด/ปิดได้:</strong> สามารถเปิด-ปิดเสียงแจ้งเตือนได้ในหน้า Orders
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">ทดสอบการแจ้งเตือน</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    คลิกปุ่มด้านล่างเพื่อทดสอบเสียงและการแจ้งเตือน
                  </p>
                  <Button
                    onClick={testNotification}
                    variant="outline"
                    size="lg"
                    className="h-12"
                  >
                    <span className="mr-2">🔔</span>
                    ทดสอบเสียงและการแจ้งเตือน
                  </Button>
                </div>

                <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                  <p className="text-sm">
                    <strong>หมายเหตุ:</strong> ลูกค้าจะต้องอนุญาตการแจ้งเตือนในเบราว์เซอร์ของตนเอง
                    ระบบจะแสดงข้อความขออนุญาตโดยอัตโนมัติเมื่อลูกค้าเข้าหน้าติดตามออเดอร์
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operation Mode */}
        <TabsContent value="mode">
          <Card>
            <CardHeader>
              <CardTitle>Operation Mode</CardTitle>
              <CardDescription>
                Choose how your business operates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Restaurant Mode</h3>
                    {operationMode === 'restaurant' && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Table-based ordering with QR codes. Customers scan QR codes at their table
                    to order food.
                  </p>
                </div>
                <Button
                  variant={operationMode === 'restaurant' ? 'default' : 'outline'}
                  onClick={() => handleModeSwitch('restaurant')}
                  disabled={operationMode === 'restaurant'}
                >
                  {operationMode === 'restaurant' ? 'Active' : 'Switch'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Market Mode</h3>
                    {operationMode === 'market' && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Queue-based ordering for food stalls and markets. Orders are assigned queue
                    numbers for pickup.
                  </p>
                </div>
                <Button
                  variant={operationMode === 'market' ? 'default' : 'outline'}
                  onClick={() => handleModeSwitch('market')}
                  disabled={operationMode === 'market'}
                >
                  {operationMode === 'market' ? 'Active' : 'Switch'}
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">คุณสมบัติของโหมดปัจจุบัน:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {operationMode === 'restaurant' ? (
                    <>
                      <li>• จัดการโต๊ะพร้อม QR Code</li>
                      <li>• ติดตามออเดอร์แยกตามโต๊ะ</li>
                      <li>• ระบบการให้บริการแบบ Dine-in</li>
                    </>
                  ) : (
                    <>
                      <li>• ระบบคิวอัตโนมัติ</li>
                      <li>• หน้าจอแสดงคิว</li>
                      <li>• ระบบแจ้งเตือนรับอาหาร</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Queue Wait Time Setting (Market Mode only) */}
              {operationMode === 'market' && (
                <div className="pt-4 border-t">
                  <label className="text-base font-semibold mb-3 block">
                    ⏰ เวลารอโดยประมาณต่อคิว
                  </label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={estimatedWaitPerQueue}
                      onChange={(e) => setEstimatedWaitPerQueue(Number(e.target.value))}
                      className="w-32 text-lg font-semibold"
                    />
                    <span className="text-lg">นาที</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    ระบุเวลาเฉลี่ยที่ใช้ในการเตรียมอาหารต่อ 1 คิว (ใช้คำนวณเวลารอสำหรับลูกค้า)
                  </p>
                  <div className="mt-3 p-3 bg-info/10 border border-info rounded-lg">
                    <p className="text-sm text-info">
                      💡 <strong>ตัวอย่าง:</strong> ถ้าตั้ง {estimatedWaitPerQueue} นาที และมี 5 คิวข้างหน้า
                      → ลูกค้าจะเห็นเวลารอประมาณ {estimatedWaitPerQueue * 5} นาที
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Settings */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Settings</CardTitle>
              <CardDescription>
                Configure tax and service charges
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tax Rate (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  VAT or sales tax percentage
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Service Charge (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={serviceChargeRate}
                  onChange={(e) => setServiceChargeRate(parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Additional service charge percentage
                </p>
              </div>

              {/* Pricing Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Pricing Example:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>100.00 {currency}</span>
                  </div>
                  {taxRate > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax ({taxRate}%):</span>
                      <span>{(100 * taxRate / 100).toFixed(2)} {currency}</span>
                    </div>
                  )}
                  {serviceChargeRate > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Service Charge ({serviceChargeRate}%):</span>
                      <span>{(100 * serviceChargeRate / 100).toFixed(2)} {currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>Total:</span>
                    <span>
                      {(100 * (1 + taxRate / 100 + serviceChargeRate / 100)).toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Codes Tab */}
        <TabsContent value="qrcodes">
          <div className="space-y-6">
            {/* Market Mode QR Code */}
            <Card>
              <CardHeader>
                <CardTitle>🏪 Market Mode QR Code</CardTitle>
                <CardDescription>
                  QR Code สำหรับลูกค้าสแกนเข้าร้านโหมดตลาดนัด (Market Mode)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* QR Code Display */}
                <div className="flex flex-col items-center p-6 bg-muted rounded-lg">
                  {marketQR ? (
                    <>
                      <div className="bg-white p-4 rounded-lg shadow-md">
                        <img
                          src={marketQR}
                          alt="Market Mode QR Code"
                          className="w-64 h-64"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-4 text-center">
                        {typeof window !== 'undefined' && `${window.location.origin}/menu?mode=market`}
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">กำลังสร้าง QR Code...</p>
                  )}
                </div>

                {/* Download Buttons */}
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button
                    onClick={() => handleDownloadMarketQR('png')}
                    disabled={!marketQR || generatingQR}
                    size="lg"
                  >
                    <span className="mr-2">📥</span>
                    ดาวน์โหลด PNG
                  </Button>
                  <Button
                    onClick={() => handleDownloadMarketQR('pdf')}
                    disabled={!marketQR || generatingQR}
                    variant="outline"
                    size="lg"
                  >
                    <span className="mr-2">📄</span>
                    {generatingQR ? 'กำลังสร้าง...' : 'ดาวน์โหลด PDF'}
                  </Button>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2">💡 วิธีใช้งาน</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                    <li>ดาวน์โหลด QR Code ในรูปแบบ PNG หรือ PDF</li>
                    <li>นำไปพิมพ์และติดไว้บริเวณหน้าร้าน</li>
                    <li>ลูกค้าสแกนเพื่อเข้าสู่เมนูโหมดตลาดนัด</li>
                    <li>ลูกค้าสามารถสั่งอาหารและรับคิวได้ทันที</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Table QR Codes Link */}
            <Card>
              <CardHeader>
                <CardTitle>🍽️ Table QR Codes</CardTitle>
                <CardDescription>
                  จัดการ QR Code สำหรับแต่ละโต๊ะในโหมดร้านอาหาร (Restaurant Mode)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">จัดการ QR Code ของโต๊ะ</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      สร้าง, แก้ไข, และดาวน์โหลด QR Code สำหรับแต่ละโต๊ะ
                    </p>
                  </div>
                  <Link href="/admin/tables">
                    <Button variant="outline" size="lg">
                      <span className="mr-2">📋</span>
                      ไปที่ Tables Management
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          size="lg"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
