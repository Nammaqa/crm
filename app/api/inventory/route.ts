import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all inventory items
export async function GET() {
  try {
    const inventoryItems = await prisma.inventory.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(inventoryItems);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

// POST - Create new inventory item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serialNumber,
      itemName,
      itemQuantity,
      produceBroughtDate,
      dateOfTakeForUse,
      quantityBalance
    } = body;

    // Validate required fields
    if (!serialNumber || !itemName || !itemQuantity || !produceBroughtDate || quantityBalance === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newInventoryItem = await prisma.inventory.create({
      data: {
        serialNumber,
        itemName,
        itemQuantity: parseInt(itemQuantity),
        produceBroughtDate: new Date(produceBroughtDate),
        dateOfTakeForUse: dateOfTakeForUse ? new Date(dateOfTakeForUse) : null,
        quantityBalance: parseInt(quantityBalance)
      }
    });

    return NextResponse.json(newInventoryItem, { status: 201 });
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    
    if (error.code === 'P2002' && error.meta?.target?.includes('serialNumber')) {
      return NextResponse.json(
        { error: 'Serial number already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}
