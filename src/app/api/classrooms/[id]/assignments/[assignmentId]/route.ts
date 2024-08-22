import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string, assignmentId: string } }
) {
  console.log('API route called with params:', params);

  const { userId } = getAuth(req);

  if (!userId) {
    console.log('Unauthorized: No user ID found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = parseInt(params.id);
    const assignmentId = parseInt(params.assignmentId);

    console.log('Parsed IDs:', { classroomId, assignmentId });

    // Check if the user is a member of the classroom
    const membership = await prisma.membership.findUnique({
      where: {
        userId_classroomId: {
          userId: userId,
          classroomId: classroomId,
        },
      },
    });

    if (!membership) {
      console.log('User not a member of the classroom');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        classroomId: classroomId,
      },
      include: {
        submissions: true,
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log('Assignment found:', assignment);

    if (!assignment) {
      console.log('Assignment not found');
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = parseInt(params.id);
    const { title, deadline } = await req.json();

    // Check if the user is a member of the classroom
    const membership = await prisma.membership.findUnique({
      where: {
        userId_classroomId: {
          userId: userId,
          classroomId: classroomId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        type: 'assignment',
        deadline: new Date(deadline),
        creatorId: userId,
        classroomId: classroomId,
      },
    });

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}