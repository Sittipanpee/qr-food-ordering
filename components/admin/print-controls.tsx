'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Order, Settings } from '@/lib/types';
import { OrderReceipt } from './order-receipt';
import { Button } from '@/components/ui/button';

export interface PrintControlsProps {
  order: Order;
  settings: Settings;
}

export function PrintControls({ order, settings }: PrintControlsProps) {
  const [size, setSize] = useState<'80mm' | '58mm'>('80mm');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Browser print handler
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Receipt-${order.order_number}`,
  });

  // PDF generation handler
  const handleDownloadPDF = async () => {
    if (!componentRef.current) return;

    setIsGeneratingPDF(true);

    try {
      // Dynamic imports
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Convert receipt to canvas
      const canvas = await html2canvas(componentRef.current, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Calculate PDF dimensions based on size
      const imgWidth = size === '80mm' ? 80 : 58;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, imgHeight],
      });

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Download PDF
      pdf.save(`Receipt-${order.order_number}-${size}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden receipt for printing */}
      <div style={{ display: 'none' }}>
        <OrderReceipt ref={componentRef} order={order} settings={settings} size={size} />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">ขนาดกระดาษ:</span>
          <div className="flex gap-1">
            <Button
              onClick={() => setSize('80mm')}
              variant={size === '80mm' ? 'default' : 'outline'}
              size="sm"
            >
              80mm
            </Button>
            <Button
              onClick={() => setSize('58mm')}
              variant={size === '58mm' ? 'default' : 'outline'}
              size="sm"
            >
              58mm
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="default" size="sm">
            <span className="mr-1">🖨️</span> พิมพ์ใบเสร็จ
          </Button>

          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
            disabled={isGeneratingPDF}
          >
            <span className="mr-1">📄</span>
            {isGeneratingPDF ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF'}
          </Button>
        </div>
      </div>

      {/* Preview (optional - can be shown in a dialog) */}
      <div className="border rounded-lg p-4 bg-gray-50 max-w-md">
        <p className="text-sm text-muted-foreground mb-2">ตัวอย่างใบเสร็จ:</p>
        <div className="bg-white border rounded overflow-auto max-h-[400px]">
          <OrderReceipt order={order} settings={settings} size={size} />
        </div>
      </div>
    </div>
  );
}
