import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white">

      <div className="flex items-center gap-2">
        <Link href="/">
          <Image
            src="/raiz_header.png"
            alt="Logo de Raiz Viva"
            width={100}
            height={100}
            className="w-70 h-70 object-contain"
          />
        </Link>
      </div>

      <nav className="flex items-center gap-6 text-sm">
        <Link href="/ecoaventuras" className="hover:text-cyan-300 transition font-medium">
          Eco-Aventuras
        </Link>
        <span>🔍</span>
        <span>👤</span>
        <button className="bg-white text-green-900 px-3 py-1 rounded-full text-sm hover:bg-gray-100 transition cursor-pointer">
          login
        </button>
      </nav>

    </header>
  );
}