import { Experiencias } from "./components/Experiencias";
import { Footer } from "./components/Footer";
import { Header } from "../../Celula1/app/components/Header";
import { Hero } from "./components/Hero";
import { AuthProvider } from '../../Celula1/app/hooks/useAuth';


export default function Home() {
  return (
    <AuthProvider>  {/* ← envuelve todo aquí */}
      <main className="flex flex-col min-h-screen bg-[#557149]">
        <Header />
        <Hero />
        <Experiencias />
        <Footer />
      </main>
    </AuthProvider>
  );
}