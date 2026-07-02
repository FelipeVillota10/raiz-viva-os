import { NextResponse } from 'next/server';

export function proxy(request: Request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const rewriteUrl = new URL(url.pathname, backendUrl);
    rewriteUrl.search = url.search;

    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}
