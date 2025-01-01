import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {

  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!prisma.notification) {
      console.error('prisma.notification is undefined');
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        users: {
          some: {
            id: userId
          }
        }
      },
      select: {
        id: true,
        message: true,
        type: true,
        createdAt: true,
        read: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}