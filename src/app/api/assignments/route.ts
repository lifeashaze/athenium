import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const assignments = await prisma.assignment.findMany({
      where: {
        classroom: {
          memberships: {
            some: {
              userId: userId
            }
          }
        }
      },
      include: {
        classroom: {
          select: {
            id: true,
            courseName: true
          }
        },
        submissions: {
          where: {
            userId: userId
          },
          select: {
            submittedAt: true
          }
        }
      }
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error in GET /api/assignments:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}