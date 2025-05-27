import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtToken } from './lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const res = NextResponse.next()
  // Skip authentication for login, signup, and auth API
  if (
    pathname.startsWith('/css') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('.') ||
    // pathname.startsWith('/images') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/users/me')
  ) {
    res.headers.append('Access-Control-Allow-Credentials', "true")
    res.headers.append('Access-Control-Allow-Origin', '*') // replace this your actual origin
    res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
    res.headers.append(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    return res;
  }

  const token = request.cookies.get('token')?.value;

  try {
    console.log('token ',token)
    const valid = token && await verifyJwtToken(token);
    if (!valid) {
        if(pathname.startsWith('/api')){
            return NextResponse.json({success:false,message:"User is not Authenticated"})
        }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    res.headers.append('Access-Control-Allow-Credentials', "true")
    res.headers.append('Access-Control-Allow-Origin', '*') // replace this your actual origin
    res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
    res.headers.append(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    return res;
  } catch (err) {
    console.error('MIDDLEWARE ERROR', err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
      Match all routes except:
      - /login
      - /signup
      - /api/auth/*
    */
    '/((?!login|signup|api/auth).*)',
  ],
};