import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(request as NextRequest);
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        assignment: {
          classroomId: params.id,
        },
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxMarks: true,
          },
        },
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
