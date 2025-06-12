// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJwtToken, sanitizeUser } from '@/lib/jwt';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userName, wbEmailId, password, phoneNumber, role = 'USER' } = body;

    // Validate inputs
    if (!userName || !wbEmailId || !password) {
      return NextResponse.json(
        { success: false, message: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { wbEmailId },
          { userName },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email or username already exists' },
        { status: 409 } // Conflict
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        userName,
        wbEmailId,
        password: hashedPassword,
        phoneNumber,
        role: role as Role,
      },
    });

    // Create a JWT token
    const token = signJwtToken(newUser);

    // Return success with user data (minus password)
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: sanitizeUser(newUser),
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}