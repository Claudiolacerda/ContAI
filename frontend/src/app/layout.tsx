import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ContAI", template: "%s | ContAI" },
  description: "Plataforma de contabilidade inteligente para contadores modernos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}