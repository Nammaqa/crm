import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all demand code assignments or filter by candidateId
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get('candidateId');

    if (candidateId) {
      const assignments = await prisma.demandCodeAssignment.findMany({
        where: { candidateId: parseInt(candidateId) },
        orderBy: { assignedDate: 'desc' }
      });
      return Response.json(assignments);
    }

    const assignments = await prisma.demandCodeAssignment.findMany({
      orderBy: { assignedDate: 'desc' }
    });
    return Response.json(assignments);
  } catch (error) {
    console.error('GET error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new demand code assignment
export async function POST(req) {
  try {
    const body = await req.json();
    const { candidateId, demandCode, status, feedback, clientInterviewStatus, notes, updatedBy } = body;

    if (!candidateId || !demandCode) {
      return Response.json(
        { error: 'candidateId and demandCode are required' },
        { status: 400 }
      );
    }

    const assignment = await prisma.demandCodeAssignment.create({
      data: {
        candidateId: parseInt(candidateId),
        demandCode,
        status: status || null,
        feedback: feedback || null,
        clientInterviewStatus: clientInterviewStatus || null,
        notes: notes || null,
        updatedBy: updatedBy || null
      }
    });

    return Response.json(assignment, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update demand code assignment
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, status, feedback, clientInterviewStatus, notes, updatedBy } = body;

    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 });
    }

    const assignment = await prisma.demandCodeAssignment.update({
      where: { id: parseInt(id) },
      data: {
        ...(status !== undefined && { status }),
        ...(feedback !== undefined && { feedback }),
        ...(clientInterviewStatus !== undefined && { clientInterviewStatus }),
        ...(notes !== undefined && { notes }),
        ...(updatedBy !== undefined && { updatedBy })
      }
    });

    return Response.json(assignment);
  } catch (error) {
    console.error('PUT error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove demand code assignment
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.demandCodeAssignment.delete({
      where: { id: parseInt(id) }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
