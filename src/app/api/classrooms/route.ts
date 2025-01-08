import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const classrooms = await prisma.classroom.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { memberships: { some: { userId: userId } } }
        ]
      },
      select: {
        id: true,
        name: true,
        code: true,
        year: true,
        division: true,
        courseCode: true,
        courseName: true,
        creator: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        assignments: {
          where: {
            deadline: { gt: now },
            NOT: {
              submissions: {
                some: { userId }
              }
            }
          },
          select: { id: true },
        },
      },
    });

    const classroomsWithPendingCount = classrooms.map(classroom => ({
      id: classroom.id,
      name: classroom.name,
      code: classroom.code,
      year: classroom.year,
      division: classroom.division,
      courseCode: classroom.courseCode,
      courseName: classroom.courseName,
      creator: classroom.creator,
      pendingAssignments: classroom.assignments.length,
    }));

    return NextResponse.json({ classrooms: classroomsWithPendingCount });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}