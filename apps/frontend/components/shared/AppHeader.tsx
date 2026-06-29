/**
 * Header unificado de la aplicación
 * @celula - Celula1
 *
 * Comportamiento:
 * - La navegación se decide por el estado real de autenticación (useAuth),
 *   NO por el prop `role` (que se mantiene solo como hint de título/estilo).
 * - En modo `backRoute`, muestra un botón "Volver" en vez de la nav por rol.
 *   Útil para páginas internas (login, registro, confirmación, etc.).
 *
 * Reglas de decisión (en `renderNav`):
 *  1. Modo back (backRoute presente) → botón Volver.
 *  2. Ruta de login detectada por pathname (/admin/login, /lider/login, /login/inicio) → sin nav.
 *  3. Área privada (role=admin|role=lider) SIN sesión → sin nav.
 *     (En área pública sí se muestra la nav pública aunque no haya sesión.)
 *  4. Área privada con sesión: nav correspondiente SOLO si el rol del usuario coincide.
 *  5. Área pública:
 *     - admin autenticado → nav de admin.
 *     - lider autenticado → nav de líder (versión pública, con "Panel Líder").
 *     - actor autenticado → nav de actor (con "Mi Perfil").
 *     - visitante sin sesión → nav pública (Mapa, Iniciar Sesión, Crear Cuenta).
 *
 * Esto evita que se muestren opciones de admin/líder:
 *  - En páginas de login.
 *  - Si el usuario no está autenticado y está en área privada.
 *  - Si el usuario se desloguea o el token expira (useAuth refleja el cambio).
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/** Roles posibles del header (solo se usan como hint de título, no como decisores de nav) */
export type HeaderRole = 'admin' | 'lider' | 'public' | 'login';

interface AppHeaderProps {
  /** Hint de contexto: afecta solo al título que se muestra junto al logo. */
  role?: HeaderRole;
  /** Si se proporciona, muestra botón "Volver" en vez de navegación por rol. */
  backRoute?: string;
  /** Título que se muestra junto al logo (requerido si backRoute está presente). */
  title?: string;
  /** Contenido custom en el lado derecho del header (REEMPLAZA toda la nav). */
  actions?: React.ReactNode;
  /** Contenido adicional en el lado derecho (COEXISTE con la nav). */
  rightSlot?: React.ReactNode;
}

/** Enlace de navegación con estilo pill */
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
        active
          ? 'bg-white/20 text-white'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
}

/** Botón de cerrar sesión */
function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ml-2"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      Cerrar Sesión
    </button>
  );
}

/** Header unificado que adapta su contenido según el estado de autenticación (useAuth). */
export function AppHeader({ role = 'public', backRoute, title, actions, rightSlot }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * useAuth se llama SIEMPRE, sin condicionales (regla de Hooks).
   * Es la fuente de verdad para decidir qué nav mostrar.
   */
  const {
    user,
    isAuthenticated,
    isLider,
    isActor,
    isTurista,
    logout,
  } = useAuth();

  /**
   * `isAdmin` se deriva del payload del JWT (campo `es_admin`).
   * `useAuth` no lo expone como helper, pero el modelo `UserPerfil` lo incluye.
   */
  const isAdmin = user?.es_admin ?? false;

  const isBackMode = !!backRoute;
  const isOnLoginRoute = pathname.includes('/login');

  /**
   * Título contextual: priorizar prop `title`, luego fallback derivado del
   * `role` o la ruta. Esto es solo cosmético, no decide la nav.
   */
  const resolvedTitle = title || (isOnLoginRoute
    ? (pathname.startsWith('/admin') ? 'Inicio de Sesión - Administrador' : 'Inicio de Sesión - Líder Territorial')
    : role === 'admin' ? 'Panel Administrador'
    : role === 'lider' ? 'Panel Líder Territorial'
    : '');

  /**
   * Cierra sesión vía el ViewModel (useAuth) y redirige.
   * Usado por las navs de admin y líder (que están dentro de layouts privados).
   */
  const handleLogout = (redirect: string) => {
    logout();
    window.location.href = redirect;
  };

  /** Logo común a todos los headers */
  const logo = (
    <div className="flex items-center gap-2">
      <Image
        src="/raiz_header.png"
        alt="Logo de Raiz Viva"
        width={256}
        height={256}
        className="w-64 h-64 object-contain mt-2"
      />
      {resolvedTitle && (
        <span className="font-medium text-base hidden sm:inline self-center">
          {resolvedTitle}
        </span>
      )}
    </div>
  );

  /** Botón de volver (para modo backRoute) */
  const backNav = (
    <button
      onClick={() => router.push(backRoute!)}
      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      Volver
    </button>
  );

  /** Navegación del administrador (solo si está autenticado como admin) */
  const adminNav = (
    <div className="flex items-center gap-2">
      <NavLink
        href="/admin/dashboard"
        active={pathname.startsWith("/admin/dashboard")}
      >
        Dashboard
      </NavLink>

      <NavLink
        href="/admin/comentarios"
        active={pathname.startsWith("/admin/comentarios")}
      >
        Comentarios
      </NavLink>
      <NavLink href="/admin/territorios" active={pathname.startsWith('/admin/territorios')}>
        Territorios
      </NavLink>
      <NavLink href="/admin/lideres" active={pathname.startsWith('/admin/lideres')}>
        Líderes
      </NavLink>
      <Link
        href="/admin/lideres/nuevo"
        className="px-3 py-1.5 rounded-full text-sm font-medium transition bg-[#8c9a80] text-white hover:bg-[#748171]"
      >
        + Nuevo Líder
      </Link>
      <LogoutButton onClick={() => handleLogout('/admin/login')} />
    </div>
  );

  /** Navegación del líder territorial (solo si está autenticado como líder) */
  const liderNav = (
    <div className="flex items-center gap-2">
      <NavLink href="/lider/aprobaciones" active={pathname.startsWith('/lider/aprobaciones')}>
        Solicitudes
      </NavLink>
      <NavLink href="/lider/actores" active={pathname.startsWith('/lider/actores')}>
        Actores
      </NavLink>
      <LogoutButton onClick={() => handleLogout('/lider/login')} />
    </div>
  );

  /** Navegación pública (visitante no autenticado en ruta pública) */
  const publicNav = (
    <div className="flex items-center gap-4">
      {pathname === '/mapa' && (
        <Link href="/">
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-medium transition">
            Volver
          </button>
        </Link>
      )}
      <Link href="/mapa">
        <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition">
          Mapa
        </button>
      </Link>

      <Link href="/login">
        <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition">
          Iniciar Sesión
        </button>
      </Link>

      <Link href="/registro">
        <button className="bg-white hover:bg-white/90 text-[#3b5c2e] px-4 py-2 rounded-full text-sm font-medium transition">
          Crear Cuenta
        </button>
      </Link>
    </div>
  );

  /** Navegación de líder autenticado (en página pública: home, mapa) */
  const liderAuthNav = (
    <div className="flex items-center gap-4">
      {pathname === '/mapa' && (
        <Link href="/">
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-medium transition">
            Volver
          </button>
        </Link>
      )}
      <span className="text-sm text-white">Hola, {user?.nombre_completo}</span>
      <button
        onClick={() => router.push('/lider/aprobaciones')}
        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition"
      >
        Panel Líder
      </button>
      <button
        onClick={() => handleLogout('/')}
        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition"
      >
        Cerrar Sesión
      </button>
    </div>
  );

  /** Navegación de actor autenticado (en página pública: home, mapa) */
  const actorAuthNav = (
    <div className="flex items-center gap-4">
      {pathname === '/mapa' && (
        <Link href="/">
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-medium transition">
            Volver
          </button>
        </Link>
      )}
      <Link href="/mi-perfil">
        <span className="text-sm text-white hover:underline cursor-pointer">
          Hola, {user?.nombre_completo}
        </span>
      </Link>
      <button
        onClick={() => handleLogout('/')}
        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition"
      >
        Cerrar Sesión
      </button>
    </div>
  );

  /** Navegación de turista autenticado (en página pública: home, mapa) */
  const turistaAuthNav = (
    <div className="flex items-center gap-4">
      {pathname === '/mapa' && (
        <Link href="/">
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-medium transition">
            Volver
          </button>
        </Link>
      )}
      <NavLink href="/comentariosTurista" active={pathname.startsWith('/comentariosTurista')}>
        Comentarios
      </NavLink>
      <span className="text-sm text-white">Hola, {user?.nombre_completo}</span>
      
      <button
        onClick={() => handleLogout('/')}
        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition"
      >
        Cerrar Sesión
      </button>
    </div>
  );

  /**
   * Selecciona qué navegación mostrar.
   * El orden importa: cada guard es excluyente.
   */
  const renderNav = () => {
    // 0. Acciones custom: reemplazan la nav por defecto
    if (actions) return actions;

    // 1. Modo back: botón de volver (gana sobre todo)
    if (isBackMode) return backNav;

    // 2. Guard: rutas de login no muestran nav
    if (isOnLoginRoute) return null;

    // 3. Guard: en área privada SIN sesión, no mostrar nav.
    //    (En área pública sí se muestra la nav pública aunque no haya sesión.)
    const isPrivateArea = role === 'admin' || role === 'lider';
    if (isPrivateArea && !isAuthenticated) return null;

    // 4. Área privada: nav correspondiente SOLO si coincide el rol.
    if (role === 'admin' && isAdmin) return adminNav;
    if (role === 'lider' && isLider) return liderNav;

    // 5. Área pública: nav adaptada al estado de auth.
    if (role === 'public') {
      if (isAdmin) return adminNav;
      if (isLider) return liderAuthNav;
      if (isActor) return actorAuthNav;
      if (isTurista) return turistaAuthNav;
      return publicNav;
    }

    return null;
  };

  return (
    <header className="flex justify-between items-center px-4 py-2 h-16 bg-[#3b5630] text-white">
      {logo}
      <div className="flex items-center gap-2">
        {renderNav()}
        {rightSlot}
      </div>
    </header>
  );
}
