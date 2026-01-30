import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "初中几何闭环训练器V1",
  description: "几何直觉训练系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className="antialiased font-sans"
      >
        {children}
      </body>
    </html>
  );
}
