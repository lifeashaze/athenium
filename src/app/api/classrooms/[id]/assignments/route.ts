import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient, Prisma } from '@prisma/client';

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

    const result = await prisma.$transaction(async (tx) => {
      // Get classroom details first
      const classroom = await tx.classroom.findUnique({
        where: { id: classroomId },
        select: { name: true }
      });

      if (!classroom) {
        throw new Error('Classroom not found');
      }

      // Create the assignment
      const newAssignment = await tx.assignment.create({
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

      // Get all classroom members
      const members = await tx.membership.findMany({
        where: {
          classroomId: classroomId,
        },
        select: {
          userId: true,
        },
      });

      // Create notification with classroom name
      const notification = await tx.notification.create({
        data: {
          message: `New assignment "${title}" has been posted in ${classroom.name}. Due: ${new Date(deadline).toLocaleDateString()}`,
          type: 'ASSIGNMENT',
          relatedId: newAssignment.id,
          users: {
            connect: members.map(member => ({ id: member.userId })),
          },
        },
      });

      return { newAssignment, notification };
    });

    return NextResponse.json(result.newAssignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
