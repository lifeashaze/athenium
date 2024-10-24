import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notificationId = parseInt(params.id, 10)
  if (isNaN(notificationId)) {
    return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 })
  }

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
