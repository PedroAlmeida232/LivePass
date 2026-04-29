import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";

export const metadata: Metadata = {
  title: "LivePass — Sistema de Ingressos",
  description:
    "Plataforma de venda e validação de ingressos com pagamento PIX e QR Code dinâmico TOTP.",
  keywords: ["ingressos", "eventos", "pix", "qrcode", "livepass"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-bg text-text-primary font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
