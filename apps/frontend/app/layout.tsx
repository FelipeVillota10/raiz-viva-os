import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from '@/hooks/useAuth';
// 1. Importamos el proveedor del carrito/paquete
import { PaqueteProvider } from "@/components/ecoaventuras/PaqueteContext"; 
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], 
});

export const metadata: Metadata = {
  title: "Raíz Viva - Conectando Comunidades",
  description: "Plataforma para el desarrollo sostenible y turismo consciente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={poppins.className}>
        <AuthProvider>
          {/* 2. Envolvemos los componentes hijos con el PaqueteProvider */}
          <PaqueteProvider>
            {children}
          </PaqueteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}