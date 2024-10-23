import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string, assignmentId: string } }
) {

  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = parseInt(params.id);
    const assignmentId = parseInt(params.assignmentId);


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
        creator: {
          select: {
            id: true,
          },
        },
      },
    });


    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string, assignmentId: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = parseInt(params.id);
    const assignmentId = parseInt(params.assignmentId);

    // Check if the user is the creator of the classroom
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { creator: true },
    });

    if (!classroom || classroom.creator.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the assignment and its submissions
    await prisma.$transaction([
      prisma.submission.deleteMany({
        where: { assignmentId: assignmentId },
      }),
      prisma.assignment.delete({
        where: { id: assignmentId },
      }),
    ]);

    return NextResponse.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
