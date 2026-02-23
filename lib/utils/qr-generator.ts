import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(
  url: string,
  options?: QRCodeOptions
): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: options?.width || 400,
      margin: options?.margin || 2,
      color: {
        dark: options?.darkColor || '#000000',
        light: options?.lightColor || '#ffffff',
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  url: string,
  options?: QRCodeOptions
): Promise<string> {
  try {
    return await QRCode.toString(url, {
      type: 'svg',
      width: options?.width || 400,
      margin: options?.margin || 2,
      color: {
        dark: options?.darkColor || '#000000',
        light: options?.lightColor || '#ffffff',
      },
    });
  } catch (error) {
    console.error('Error generating QR code SVG:', error);
    throw error;
  }
}

/**
 * Download QR code as PNG
 */
export function downloadQRCode(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download QR code as SVG
 */
export function downloadQRCodeSVG(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download QR code as PDF
 */
export async function downloadQRCodePDF(
  dataUrl: string,
  filename: string,
  options?: { title?: string; subtitle?: string }
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add title if provided
  if (options?.title) {
    pdf.setFontSize(16);
    pdf.text(options.title, 105, 20, { align: 'center' });
  }

  // Add subtitle if provided
  if (options?.subtitle) {
    pdf.setFontSize(10);
    pdf.text(options.subtitle, 105, 30, { align: 'center' });
  }

  // Add QR code image (centered)
  const qrSize = 80; // 80mm
  const x = (210 - qrSize) / 2; // Center on A4 width (210mm)
  const y = options?.title ? 40 : 20;

  pdf.addImage(dataUrl, 'PNG', x, y, qrSize, qrSize);

  // Save PDF
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
