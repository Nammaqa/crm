import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import type { NextRequest } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    await prisma.reminder.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const reminderId = parseInt(params.id);

    // Update the reminder based on the provided data
    const reminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        companyName: data.companyName,
        phoneNumber: data.phoneNumber,
        followUpDateTime: new Date(data.followUpDateTime),
        notes: data.notes,
      },
    });

    return NextResponse.json(reminder);
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json({ error: 'Failed to update reminder' }, { status: 500 });
  }
}
