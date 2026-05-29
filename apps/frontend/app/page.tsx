import { Experiencias } from "./components/Experiencias";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";


export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#557149]">
      <Header />
      <Hero />
      <Experiencias />
      <Footer />
    </main>
  );
}