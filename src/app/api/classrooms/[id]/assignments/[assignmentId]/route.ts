import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string, assignmentId: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = params.id;
    const assignmentId = params.assignmentId;
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
    const classroomId = params.id;
    const assignmentId = params.assignmentId;

    // // Check if user is the creator of the classroom
    // const classroom = await prisma.classroom.findUnique({
    //   where: { id: classroomId },
    //   include: { creator: true },
    // });

    // if (!classroom || classroom.creator.id !== userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify that we have the assignment ID
    if (!params.assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: {
        id: params.assignmentId,
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            creator: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        submissions: {
          where: {
            userId: userId,
          },
          select: {
            id: true,
            content: true,
            marks: true,
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
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
