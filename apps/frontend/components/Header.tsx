import Image from "next/image";
import Link from 'next/link';

export function Header() {
  return (
    <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white">
      
      <div className="flex items-center gap-2">
      {  /*<div className="w-8 h-8 bg-white rounded-full"></div>*/}
        <Image
          src="/raiz_header.png"
          alt="Logo de Raiz Viva"
          width={512}
          height={512}
          className="w-70 h-70 object-contain"
        />
        {/*<span className="font-semibold">Raiz viva</span>*/}  
      </div>

      <div className="flex items-center gap-4">
        <span>🔍</span>
        <span>👤</span>

        <Link href="/login">
          <button className="bg-white text-green-900 px-3 py-1 rounded-full text-sm hover:bg-gray-700 transition cursor-pointer">
            login
          </button>
        </Link>
      </div>

    </header>
  ); 
}