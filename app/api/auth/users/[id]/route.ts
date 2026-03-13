// app/api/auth/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userName, wbEmailId, password, phoneNumber, role } = body;

    // Validate inputs
    if (!userName || !wbEmailId) {
      return NextResponse.json(
        { success: false, message: 'Username and email are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if another user has the same email or username
    const duplicateUser = await prisma.user.findFirst({
      where: {
        OR: [
          { wbEmailId },
          { userName },
        ],
        NOT: { id: parseInt(id) },
      },
    });

    if (duplicateUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Prepare update data
    const updateData: any = {
      userName,
      wbEmailId,
      phoneNumber,
      role: role as Role,
    };

    // If password is provided, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        userName: updatedUser.userName,
        wbEmailId: updatedUser.wbEmailId,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during update' },
      { status: 500 }
    );
  }
}