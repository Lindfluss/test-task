import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const interSans = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
    title: "Next Demo: SSR/SSG/CSR/Static",
    description: "Тестовое задание",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${interSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
