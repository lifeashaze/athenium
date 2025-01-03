import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user is the creator of the classroom
    const classroom = await prisma.classroom.findUnique({
      where: { id: params.id },
      select: { creatorId: true, courseName: true }
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Don't allow the creator to leave their own classroom
    if (classroom.creatorId === userId) {
      return NextResponse.json(
        { error: 'Cannot leave a classroom you created' }, 
        { status: 400 }
      );
    }

    // Delete the membership
    await prisma.membership.delete({
      where: {
        userId_classroomId: {
          userId: userId,
          classroomId: params.id
        }
      }
    });

    return NextResponse.json({ message: 'Successfully left the classroom' });
  } catch (error) {
    console.error('Error leaving classroom:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}