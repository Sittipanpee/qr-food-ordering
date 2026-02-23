import { forwardRef } from 'react';
import { Order, Settings } from '@/lib/types';
import { format } from 'date-fns';

export interface OrderReceiptProps {
  order: Order;
  settings: Settings;
  size?: '80mm' | '58mm';
}

export const OrderReceipt = forwardRef<HTMLDivElement, OrderReceiptProps>(
  ({ order, settings, size = '80mm' }, ref) => {
    const width = size === '80mm' ? '302px' : '219px'; // 80mm = 302px, 58mm = 219px
    const isRestaurantMode = order.mode === 'restaurant';

    // Calculate pricing
    const subtotal = order.total_amount;
    const taxAmount = subtotal * settings.tax_rate;
    const serviceChargeAmount = subtotal * settings.service_charge_rate;
    const total = subtotal + taxAmount + serviceChargeAmount;

    // Format currency
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: settings.currency,
      }).format(price);
    };

    return (
      <div
        ref={ref}
        className="receipt-container"
        style={{
          width,
          maxWidth: width,
          margin: '0 auto',
          padding: '16px 12px',
          fontFamily: '"Sarabun", system-ui, -apple-system, sans-serif',
          fontSize: size === '80mm' ? '14px' : '12px',
          lineHeight: '1.5',
          color: '#000',
          backgroundColor: '#fff',
        }}
      >
        {/* Header - Restaurant Info */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1
            style={{
              fontSize: size === '80mm' ? '20px' : '18px',
              fontWeight: 'bold',
              margin: '0 0 4px 0',
            }}
          >
            {settings.restaurant_name}
          </h1>
          {settings.restaurant_description && (
            <p
              style={{
                fontSize: size === '80mm' ? '12px' : '10px',
                color: '#666',
                margin: '0 0 8px 0',
              }}
            >
              {settings.restaurant_description}
            </p>
          )}
          <div
            style={{
              borderTop: '2px dashed #000',
              borderBottom: '2px dashed #000',
              padding: '8px 0',
              marginTop: '8px',
            }}
          >
            <p style={{ fontSize: size === '80mm' ? '16px' : '14px', fontWeight: 'bold', margin: 0 }}>
              ใบเสร็จรับเงิน / RECEIPT
            </p>
          </div>
        </div>

        {/* Order Info */}
        <div style={{ marginBottom: '16px' }}>
          <table style={{ width: '100%', fontSize: 'inherit' }}>
            <tbody>
              <tr>
                <td style={{ padding: '2px 0' }}>เลขที่ใบเสร็จ:</td>
                <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 'bold' }}>
                  {order.order_number}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '2px 0' }}>วันที่:</td>
                <td style={{ padding: '2px 0', textAlign: 'right' }}>
                  {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                </td>
              </tr>
              {isRestaurantMode && order.table_number && (
                <tr>
                  <td style={{ padding: '2px 0' }}>โต๊ะ:</td>
                  <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 'bold' }}>
                    {order.table_number}
                  </td>
                </tr>
              )}
              {!isRestaurantMode && order.queue_number && (
                <tr>
                  <td style={{ padding: '2px 0' }}>คิวที่:</td>
                  <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 'bold' }}>
                    {order.queue_number}
                  </td>
                </tr>
              )}
              {order.customer_name && (
                <tr>
                  <td style={{ padding: '2px 0' }}>ชื่อลูกค้า:</td>
                  <td style={{ padding: '2px 0', textAlign: 'right' }}>
                    {order.customer_name}
                  </td>
                </tr>
              )}
              {order.customer_phone && (
                <tr>
                  <td style={{ padding: '2px 0' }}>เบอร์โทร:</td>
                  <td style={{ padding: '2px 0', textAlign: 'right' }}>
                    {order.customer_phone}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed #000', marginBottom: '12px' }} />

        {/* Order Items */}
        <div style={{ marginBottom: '16px' }}>
          <table style={{ width: '100%', fontSize: 'inherit' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ padding: '4px 0', textAlign: 'left' }}>รายการ</th>
                <th style={{ padding: '4px 0', textAlign: 'center', width: '40px' }}>จำนวน</th>
                <th style={{ padding: '4px 0', textAlign: 'right', width: '70px' }}>ราคา</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr
                  key={item.id || index}
                  style={{
                    pageBreakInside: 'avoid',
                    borderBottom: index === order.items.length - 1 ? '1px solid #000' : 'none',
                  }}
                >
                  <td style={{ padding: '6px 0', verticalAlign: 'top' }}>
                    <div>{item.menu_item_name}</div>
                    {item.notes && (
                      <div style={{ fontSize: '0.9em', color: '#666', marginTop: '2px' }}>
                        หมายเหตุ: {item.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '6px 0', textAlign: 'center', verticalAlign: 'top' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '6px 0', textAlign: 'right', verticalAlign: 'top' }}>
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div style={{ marginBottom: '16px', fontSize: '0.95em' }}>
            <strong>หมายเหตุ:</strong> {order.notes}
          </div>
        )}

        {/* Pricing Summary */}
        <div style={{ marginBottom: '16px' }}>
          <table style={{ width: '100%', fontSize: 'inherit' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0' }}>ยอดรวม (Subtotal):</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>
                  {formatPrice(subtotal)}
                </td>
              </tr>
              {settings.tax_rate > 0 && (
                <tr>
                  <td style={{ padding: '4px 0' }}>
                    ภาษี {(settings.tax_rate * 100).toFixed(0)}% (Tax):
                  </td>
                  <td style={{ padding: '4px 0', textAlign: 'right' }}>
                    {formatPrice(taxAmount)}
                  </td>
                </tr>
              )}
              {settings.service_charge_rate > 0 && (
                <tr>
                  <td style={{ padding: '4px 0' }}>
                    ค่าบริการ {(settings.service_charge_rate * 100).toFixed(0)}% (Service):
                  </td>
                  <td style={{ padding: '4px 0', textAlign: 'right' }}>
                    {formatPrice(serviceChargeAmount)}
                  </td>
                </tr>
              )}
              <tr style={{ borderTop: '2px solid #000', fontWeight: 'bold', fontSize: '1.1em' }}>
                <td style={{ padding: '8px 0' }}>ยอดรวมทั้งสิ้น (Total):</td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>
                  {formatPrice(total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '2px dashed #000', marginBottom: '12px' }} />

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: size === '80mm' ? '12px' : '10px' }}>
          <p style={{ margin: '4px 0' }}>ขอบคุณที่ใช้บริการ</p>
          <p style={{ margin: '4px 0' }}>Thank you for your order!</p>
          {order.tracking_url && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ margin: '4px 0', fontWeight: 'bold' }}>ติดตามสถานะออเดอร์:</p>
              <p
                style={{
                  margin: '4px 0',
                  fontSize: '10px',
                  wordBreak: 'break-all',
                }}
              >
                {order.tracking_url}
              </p>
            </div>
          )}
        </div>

        {/* Print-only styles */}
        <style jsx>{`
          @media print {
            @page {
              size: ${size} auto;
              margin: 0;
            }

            .receipt-container {
              width: ${width} !important;
              max-width: ${width} !important;
            }

            * {
              color: #000 !important;
              background: #fff !important;
            }

            tr {
              page-break-inside: avoid;
            }
          }

          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
        `}</style>
      </div>
    );
  }
);

OrderReceipt.displayName = 'OrderReceipt';
