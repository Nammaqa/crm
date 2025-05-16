import { NextResponse } from 'next/server';

export async function POST() {
  // Create a response object
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear the 'token' cookie by setting it to empty and expiring it immediately
  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0, // Expire immediately
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}