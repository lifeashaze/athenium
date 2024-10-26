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

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        classroomId: classroomId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
          },
        },
        submissions: true,
        classroom: {
          select: {
            id: true,
            name: true,
            creator: {
              select: {
                id: true,
                email: true,
              }
            }
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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
    const { title, deadline, description, maxMarks, requirements } = await req.json();

    // Check if user is the creator of the classroom
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { creator: true },
    });

    if (!classroom || classroom.creator.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedAssignment = await prisma.assignment.update({
      where: {
        id: assignmentId,
        classroomId: classroomId,
      },
      data: {
        title,
        description,
        maxMarks,
        requirements,
        deadline: new Date(deadline),
      },
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
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

    // Check if user is the creator of the classroom
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
