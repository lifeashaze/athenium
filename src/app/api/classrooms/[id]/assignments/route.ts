import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = parseInt(params.id, 10);
    if (isNaN(classroomId)) {
      return NextResponse.json({ error: 'Invalid classroom ID' }, { status: 400 });
    }

    const { title, type, deadline } = await req.json();

    if (!title || !type || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        type,
        deadline: new Date(deadline),
        creatorId: userId,
        classroomId,
      },
      include: {
        creator: {
          select: {
            firstName: true,
          },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = parseInt(params.id, 10);
    if (isNaN(classroomId)) {
      return NextResponse.json({ error: 'Invalid classroom ID' }, { status: 400 });
    }

    const assignments = await prisma.assignment.findMany({
      where: { classroomId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}