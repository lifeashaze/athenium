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
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignments: {
          where: {
            deadline: {
              gt: now // Only get assignments that haven't passed deadline
            },
            // Exclude assignments that the user has already submitted
            NOT: {
              submissions: {
                some: {
                  userId: userId
                }
              }
            }
          },
          select: {
            id: true,
            deadline: true
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
                role: true,
              },
            },
          },
        },
      },
    });

    // Transform the response to include pending assignments count
    const classroomsWithPendingCount = classrooms.map(classroom => ({
      ...classroom,
      pendingAssignments: classroom.assignments.length,
      assignments: undefined // Remove the assignments array from response
    }));

    return NextResponse.json({ classrooms: classroomsWithPendingCount });
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
