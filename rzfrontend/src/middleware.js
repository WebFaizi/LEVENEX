import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Skip IP check for the IP banned page itself to avoid infinite loop
  if (request.nextUrl.pathname === '/ip-banned') {
    return NextResponse.next();
  }

  // Skip IP check for static files and API routes
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/static') ||
      request.nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get client IP with multiple fallbacks
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  let clientIp = '';
  
  if (forwardedFor) {
    clientIp = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    clientIp = realIp;
  } else if (cfConnectingIp) {
    clientIp = cfConnectingIp;
  } else {
    clientIp = request.ip || '';
  }

  // Clean the IP
  clientIp = clientIp.replace('::ffff:', '').replace('::1', '127.0.0.1');

  console.log('Next.js Middleware - Checking IP:', clientIp, 'for path:', request.nextUrl.pathname);

  // Skip localhost and private IPs
  const isLocalhost = clientIp === '127.0.0.1' || 
                     clientIp === 'localhost' || 
                     clientIp === '::1' ||
                     clientIp.startsWith('192.168.') ||
                     clientIp.startsWith('10.') ||
                     clientIp.startsWith('172.16.') ||
                     clientIp === '';

  // Check if IP is banned (only for non-localhost IPs)
  if (!isLocalhost && clientIp) {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL 
      const checkUrl = `${API_BASE_URL}/check-ip-banned?ip_address=${encodeURIComponent(clientIp)}`;
      
      console.log('Checking ban status at:', checkUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(checkUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('Ban check response:', data);
        
        if (data.status === 1 && data.data?.isBanned) {
          console.log('IP is banned, redirecting to /ip-banned');
          // Redirect to IP banned page
          return NextResponse.redirect(new URL('/ip-banned', request.url));
        }
      }
    } catch (error) {
      // Don't block on error, just log it
      console.error('Error checking IP ban status in middleware:', error.message);
    }
  } else {
    console.log('Skipping IP check for localhost:', clientIp);
  }

  const nextResponse = NextResponse.next();

  // Add cache headers for static assets
  if (request.nextUrl.pathname.startsWith('/static/') || 
      request.nextUrl.pathname.includes('.') && 
      (request.nextUrl.pathname.endsWith('.js') || 
       request.nextUrl.pathname.endsWith('.css') ||
       request.nextUrl.pathname.endsWith('.png') ||
       request.nextUrl.pathname.endsWith('.jpg') ||
       request.nextUrl.pathname.endsWith('.svg'))) {
    
    nextResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Add cache headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    nextResponse.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  }

  // Add security headers
  nextResponse.headers.set('X-Content-Type-Options', 'nosniff');
  nextResponse.headers.set('X-Frame-Options', 'DENY');
  nextResponse.headers.set('X-XSS-Protection', '1; mode=block');
  nextResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add compression hint
  nextResponse.headers.set('Vary', 'Accept-Encoding');

  return nextResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};