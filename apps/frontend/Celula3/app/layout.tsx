import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { PaqueteProvider } from "./components/PaqueteContext";
import PaqueteCarrito from "./components/PaqueteCarrito";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Raíz Viva – Eco-Aventuras",
  description: "Descubre y vive experiencias conscientes en territorios vivos",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={poppins.className}>
        <PaqueteProvider>      
          {children}
          <PaqueteCarrito />
        </PaqueteProvider>
      </body>
    </html>
  );
}
