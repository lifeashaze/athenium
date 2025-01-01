import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user details to match year and division
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { year: true, division: true }
    })

    if (!user?.year || !user?.division) {
      return NextResponse.json({ invitations: [] })
    }

    // Find all classrooms matching user's year and division
    // where the user is not a member
    const invitations = await prisma.classroom.findMany({
      where: {
        AND: [
          { year: user.year },
          { division: user.division },
          {
            memberships: {
              none: {
                userId
              }
            }
          }
        ]
      },
      select: {
        id: true,
        courseName: true,
        courseCode: true,
        year: true,
        division: true,
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            memberships: true
          }
        }
      }
    })

    // Transform the data to match our interface
    const formattedInvitations = invitations.map(inv => ({
      id: inv.id,
      courseName: inv.courseName,
      courseCode: inv.courseCode,
      year: inv.year,
      division: inv.division,
      professor: inv.creator,
      memberCount: inv._count.memberships
    }))

    return NextResponse.json({ invitations: formattedInvitations })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}