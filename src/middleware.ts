import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/auth/login', '/auth/error'];

export function middleware(request: NextRequest) {
	const { pathname, searchParams } = request.nextUrl;
	const token = request.cookies.get('user-token');

	const isPublicPath = publicPaths.includes(pathname);
	const isAuthPage = pathname.startsWith('/auth');

	// If the user is already logged in and trying to access public auth pages, redirect them back
	if (token && isAuthPage) {
		const redirectBack = searchParams.get('redirect') || '/';
		return NextResponse.redirect(new URL(redirectBack, request.url));
	}

	// If the user is NOT authenticated and tries to access a protected route
	if (!token && !isPublicPath) {
		const loginUrl = new URL('/auth/login', request.url);
		loginUrl.searchParams.set('redirect', pathname); // Save path to come back after login
		return NextResponse.redirect(loginUrl);
	}

	// Allow access
	const response = NextResponse.next();

	// Security header
	response.headers.set('X-Content-Type-Options', 'nosniff');

	// Cache control by file type or path
	if (pathname.match(/\.(js|css|jpg|jpeg|png|webp|avif|ico|svg)$/)) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	} else if (pathname.startsWith('/api/')) {
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
	} else {
		response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
	}

	return response;
}

export const config = {
	matcher: [
		// Apply middleware only to required routes
		'/((?!api|_next|_static|_vercel|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|js|css)).*)',
	],
};
