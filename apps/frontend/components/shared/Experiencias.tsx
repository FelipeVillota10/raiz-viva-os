/**
 * Sección de experiencias
 * @celula - Celula1
 * Muestra la sección de experiencias en la página principal.
 */

import Image from "next/image";

export function Experiencias() {
  return (
    <section className="bg-[#f9f3e7] py-10 px-6 text-center">

      <h2 className="text-xl font-bold text-green-900 mb-2">
        ¿Qué experiencia quieres vivir?
      </h2>

      <p className="text-gray-600 mb-4">
        Participa y crea experiencias conscientes...
      </p>

      <button className="bg-green-800 text-white px-4 py-2 rounded-full mb-6 hover:bg-green-700 transition cursor-pointer">
        Quiero vivirlo
      </button>

      {/* Imágenes de ejemplo — serán dinámicas en futuras iteraciones */}
      <div className="grid grid-cols-3 gap-2">

        <div className="h-40 relative rounded overflow-hidden  hover:scale-110 transition">
          <Image
            src="/playa.jpg"
            alt="Playa"
            fill
            className="object-cover"
          />
        </div>

        <div className="h-40 relative rounded overflow-hidden  hover:scale-110 transition">
          <Image
            src="/cocora.jpg"
            alt="Cocora"
            fill
            className="object-cover"
          />
        </div>

        <div className="h-40 relative rounded overflow-hidden  hover:scale-110 transition">
          <Image
            src="/lago.jpg"
            alt="Lago"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
