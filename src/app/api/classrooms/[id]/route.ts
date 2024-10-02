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
    const classroomId = parseInt(params.id, 10);
    if (isNaN(classroomId)) {
      return NextResponse.json({ error: 'Invalid classroom ID' }, { status: 400 });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        admin: { 
          select: { 
            id: true,
            firstName: true,
            email: true,
          } 
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
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

    // Check if the user is the admin or a member of the classroom
    const isAdmin = classroom.adminId === userId;
    const isMember = classroom.memberships.some(membership => membership.userId === userId);

    if (!isAdmin && !isMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const members = classroom.memberships.map(membership => membership.user);

    return NextResponse.json({
      classroom: {
        id: classroom.id,
        name: classroom.name,
        code: classroom.code,
        inviteLink: classroom.inviteLink,
        adminFirstName: classroom.admin.firstName,
        courseCode: classroom.courseCode,
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
    const classroomId = parseInt(params.id, 10);
    if (isNaN(classroomId)) {
      return NextResponse.json({ error: 'Invalid classroom ID' }, { status: 400 });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      include: { admin: true },
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    if (classroom.adminId !== userId) {
      return NextResponse.json({ error: 'You are not authorized to delete this classroom' }, { status: 403 });
    }

    // Delete all memberships associated with the classroom
    await prisma.membership.deleteMany({
      where: { classroomId: classroomId },
    });

    // Delete the classroom
    await prisma.classroom.delete({
      where: { id: classroomId },
    });

    return NextResponse.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Error deleting classroom:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}