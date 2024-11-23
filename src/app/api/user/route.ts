import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuth } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        rollNo: true,
        year: true,
        division: true,
        srn: true,
        prn: true,
        officeHours: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error in GET /api/user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = getAuth(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        rollNo: body.rollNo,
        year: body.year,
        division: body.division,
        srn: body.srn,
        prn: body.prn,
        officeHours: body.officeHours,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        rollNo: true,
        year: true,
        division: true,
        srn: true,
        prn: true,
        officeHours: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error in PUT /api/user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
