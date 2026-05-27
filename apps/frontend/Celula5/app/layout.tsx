import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Raíz Viva Dashboard",
  description: "Panel de control de métricas de Raíz Viva",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
