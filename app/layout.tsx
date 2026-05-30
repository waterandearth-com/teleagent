import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tối nay em muốn ăn gì?",
  description: "Một ứng dụng nhỏ xinh để chọn bữa tối cho hai người."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
