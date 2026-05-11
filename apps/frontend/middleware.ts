import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const url = new URL(request.url);

  // API proxy
  if (url.pathname.startsWith('/api/c')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      return NextResponse.next();
    }
    return NextResponse.rewrite(new URL(url.pathname, backendUrl));
  }

  // Protect /lider/* routes — require valid token with es_lider=true (except /lider/login)
  if (url.pathname.startsWith('/lider/') && !url.pathname.startsWith('/lider/login')) {
    const token = request.cookies.get('access_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/lider/login', request.url));
    }
    const payload = decodeJWT(token);
    if (!payload || payload['es_lider'] !== true) {
      return NextResponse.redirect(new URL('/lider/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/lider/:path*'],
};