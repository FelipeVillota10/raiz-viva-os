'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  return (
    <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white">
      
      <div className="flex items-center gap-2">
        <Image
          src="/raiz_header.png"
          alt="Logo de Raiz Viva"
          width={100}
          height={100}
          className="w-70 h-70 object-contain"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/registro')}
          className="bg-white text-green-900 px-3 py-1 rounded-full text-sm hover:bg-gray-100 transition cursor-pointer"
        >
          login
        </button>
      </div>

    </header>
  ); 
}