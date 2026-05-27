import Link from "next/link";

export function Header() {
  return (
    <header className="bg-[#3a5c2e] text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl font-bold tracking-tight">🌿 Raíz Viva</span>
        <span className="text-sm text-green-200 hidden sm:block">Eco-Aventuras</span>
      </Link>
      <nav className="flex gap-4 text-sm font-medium">
        <Link href="/" className="hover:text-green-300 transition">Catálogo</Link>
        <Link href="/admin" className="bg-[#7a9e6a] hover:bg-[#557149] px-3 py-1 rounded-full transition">
          Panel Admin
        </Link>
      </nav>
    </header>
  );
}
