import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roots Pain Point Studio",
  description: "A facilitated workshop tool for mapping where AI can ease the work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
