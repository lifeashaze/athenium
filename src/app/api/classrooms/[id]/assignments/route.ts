import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = params.id;

    // Check if user is a member of the classroom
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

    const assignments = await prisma.assignment.findMany({
      where: {
        classroomId: classroomId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        maxMarks: true,
        requirements: true,
        deadline: true,
        creatorId: true,
        classroomId: true,
        creator: {
          select: {
            firstName: true
          }
        },
        submissions: {
          where: {
            userId: userId
          },
          select: {
            id: true,
            submittedAt: true,
            marks: true
          }
        }
      },
      orderBy: {
        deadline: 'asc',
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
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
    const classroomId = params.id;
    const { title, deadline, description, maxMarks, requirements } = await req.json();

    // Check if user is a member of the classroom
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
        description,
        maxMarks,
        requirements,
        deadline: new Date(deadline),
        creatorId: userId,
        classroomId: classroomId,
      },
      include: {
        creator: {
          select: {
            firstName: true,
          },
        },
      },
    });

    return NextResponse.json(newAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
