import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

const userIncludeQuery = {
  memberships: {
    include: {
      classroom: true
    }
  },
  classroomsCreated: true,
  assignmentsCreated: {
    include: {
      classroom: true
    }
  },
  submissions: {
    include: {
      assignment: {
        include: {
          classroom: true
        }
      }
    }
  },
  resourcesUploaded: {
    include: {
      classroom: true
    }
  },
  notifications: true
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    /* Admin check - uncomment to enable
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    if (user?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }
    */

    const users = await prisma.user.findMany({
      include: userIncludeQuery
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    /* Admin check - uncomment to enable
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    if (adminUser?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }
    */

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return new NextResponse('User ID is required', { status: 400 })
    }

    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    )

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...updateData,
        role: updateData.role ? updateData.role as 'STUDENT' | 'PROFESSOR' | 'ADMIN' : undefined,
      },
      include: userIncludeQuery
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    /* Admin check - uncomment to enable
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    if (adminUser?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }
    */

    const url = new URL(req.url)
    const targetUserId = url.searchParams.get('id')

    if (!targetUserId) {
      return new NextResponse('User ID is required', { status: 400 })
    }

    await prisma.user.delete({
      where: { id: targetUserId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    /* Admin check - uncomment to enable
    const adminUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
    if (adminUser?.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }
    */

    const body = await req.json()
    const { userId: targetUserId, classroomId, action } = body

    if (!targetUserId || !classroomId) {
      return new NextResponse('User ID and Classroom ID are required', { status: 400 })
    }

    if (action === 'removeMembership') {
      // Delete the membership
      await prisma.membership.delete({
        where: {
          userId_classroomId: {
            userId: targetUserId,
            classroomId
          }
        }
      })

      // Fetch the updated user data
      const updatedUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        include: userIncludeQuery
      })

      if (!updatedUser) {
        return new NextResponse('User not found', { status: 404 })
      }

      return NextResponse.json({ user: updatedUser })
    }

    return new NextResponse('Invalid action', { status: 400 })
  } catch (error) {
    console.error('Error managing membership:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
