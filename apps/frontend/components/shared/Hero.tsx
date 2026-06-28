/**
 * Hero section de la página principal
 * @celula - Celula1
 * Sección destacada con imagen y llamado a la acción.
 */

import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="bg-[#557149] text-white px-6 py-12 relative">
      {/* Elemento decorativo de fondo */}
      <div className="absolute right-10 top-10 w-10 h-10 bg-cyan-400 rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="mb-6 md:mb-0">
          <Image
            src="/raiz_hero.png"
            alt="Imagen de un árbol"
            width={200}
            height={200}
            className="rounded-lg h-80 w-80"
          />
        </div>

        <div className="text-center md:text-left max-w-sm">
          <h1 className="text-3xl font-bold mb-2">
            Raiz Viva!
          </h1>

          <p className="mb-4 text-gray-200">
            Un espacio para crear y disfrutar Eco experiencias
          </p>

          <Link href="/turista/eventos" className="inline-block bg-cyan-400 text-black px-4 py-2 rounded-full font-semibold hover:bg-cyan-300 transition cursor-pointer">
            Unirme a la Aventura
          </Link>
        </div>
      </div>
    </section>
  );
}
