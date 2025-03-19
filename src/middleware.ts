import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Basic list of public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/logout', '/clear-cache', '/debug-auth', '/api/auth', '/api/create-admin'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // This refreshes the session if needed
  const { data: { session } } = await supabase.auth.getSession();
  
  const url = req.nextUrl.clone();
  const { pathname } = url;
  
  // Skip auth check for public routes and static assets
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isStaticAsset = pathname.includes('/_next/') || 
                       pathname.includes('/images/') || 
                       pathname.endsWith('.ico') || 
                       pathname.endsWith('.svg') || 
                       pathname.endsWith('.png');
  
  if (isPublicRoute || isStaticAsset) {
    return res;
  }
  
  // If no session and trying to access protected route
  if (!session && !isPublicRoute) {
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }
  
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 