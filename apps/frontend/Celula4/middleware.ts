import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/c')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!backendUrl) {
      console.error('NEXT_PUBLIC_API_URL no está configurada');
      return NextResponse.next();
    }

        let backendPath = url.pathname.replace('/api/c/', '/api/');
        if (!backendPath.endsWith('/')) {
            backendPath += '/';
        }
        return NextResponse.rewrite(new URL(backendPath, backendUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/c/:path*',
}
