import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sarabun } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QR Food Ordering System",
  description: "Modern food ordering system with QR code support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} ${inter.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
