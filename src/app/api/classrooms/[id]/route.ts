import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = params.id;

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        creator: { 
          select: { 
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          } 
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Check if the user is the creator or a member of the classroom
    const isCreator = classroom.creatorId === userId;
    const isMember = classroom.memberships.some(membership => membership.userId === userId);

    if (!isCreator && !isMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const members = classroom.memberships.map(membership => membership.user);

    return NextResponse.json({
      classroom: {
        id: classroom.id,
        name: classroom.name,
        code: classroom.code,
        inviteLink: classroom.inviteLink,
        creatorFirstName: classroom.creator.firstName,
        creatorLastName: classroom.creator.lastName,
        creatorEmail: classroom.creator.email,
        courseCode: classroom.courseCode,
        courseName: classroom.courseName,
        year: classroom.year,
        division: classroom.division,
      },
      members: members,
    });
  } catch (error) {
    console.error('Error fetching classroom:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = params.id;

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { creator: true },
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    if (classroom.creatorId !== userId) {
      return NextResponse.json({ error: 'You are not authorized to delete this classroom' }, { status: 403 });
    }

    // Delete all related records in the correct order to avoid foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete submissions for all assignments in the classroom
      await tx.submission.deleteMany({
        where: {
          assignment: {
            classroomId: classroomId
          }
        }
      });

      // Delete assignments
      await tx.assignment.deleteMany({
        where: { classroomId: classroomId }
      });

      // Delete attendances
      await tx.attendance.deleteMany({
        where: { classroomId: classroomId }
      });

      // Delete resources
      await tx.resource.deleteMany({
        where: { classroomId: classroomId }
      });

      // Delete notes
      await tx.note.deleteMany({
        where: { classroomId: classroomId }
      });

      // Delete memberships
      await tx.membership.deleteMany({
        where: { classroomId: classroomId }
      });

      // Finally, delete the classroom
      await tx.classroom.delete({
        where: { id: classroomId }
      });
    });

    return NextResponse.json({ message: 'Classroom and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


