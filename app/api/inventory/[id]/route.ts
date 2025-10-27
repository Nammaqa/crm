import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch single inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid inventory ID' },
        { status: 400 }
      );
    }

    const inventoryItem = await prisma.inventory.findUnique({
      where: { id }
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(inventoryItem);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

// PUT - Update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid inventory ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      serialNumber,
      itemName,
      itemQuantity,
      produceBroughtDate,
      dateOfTakeForUse,
      quantityBalance
    } = body;

    // Check if inventory item exists
    const existingItem = await prisma.inventory.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const updatedInventoryItem = await prisma.inventory.update({
      where: { id },
      data: {
        serialNumber,
        itemName,
        itemQuantity: parseInt(itemQuantity),
        produceBroughtDate: new Date(produceBroughtDate),
        dateOfTakeForUse: dateOfTakeForUse ? new Date(dateOfTakeForUse) : null,
        quantityBalance: parseInt(quantityBalance)
      }
    });

    return NextResponse.json(updatedInventoryItem);
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    
    if (error.code === 'P2002' && error.meta?.target?.includes('serialNumber')) {
      return NextResponse.json(
        { error: 'Serial number already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid inventory ID' },
        { status: 400 }
      );
    }

    // Check if inventory item exists
    const existingItem = await prisma.inventory.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    await prisma.inventory.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Inventory item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
