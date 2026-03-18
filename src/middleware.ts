import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('mwf_auth');
  
  // Skip authentication for cron jobs or API endpoints where we might not want strict UI auth right now
  if (request.nextUrl.pathname.startsWith('/api/cron') || request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  if (!auth && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (auth && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
