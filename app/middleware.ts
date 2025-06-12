// import { NextRequest, NextResponse } from 'next/server';
// import { verifyJwtToken } from '@/lib/jwt';

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get('token')?.value;
//   console.log("tokencaleld");
//   // If no token or invalid token, redirect to login
//   if (!token || !verifyJwtToken(token)) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // Token is valid, allow access
//   return NextResponse.next();
// }

// // Protect /admin and /bdsales and all their subpaths
// export const config = {
//   matcher: ['/admin/:path*', '/api/lead'],
// };