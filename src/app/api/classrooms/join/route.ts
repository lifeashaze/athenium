import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  console.log('Received request at /api/classrooms/join');

  const { userId } = getAuth(req);

  if (!userId) {
    console.log('Unauthorized: No user ID found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code } = await req.json();

  try {
    const classroom = await prisma.classroom.findUnique({ where: { code } });

    if (!classroom) {
      console.log('Classroom not found');
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    await prisma.membership.create({
      data: {
        user: { connect: { id: userId } },
        classroom: { connect: { id: classroom.id } },
      },
    });

    console.log('Joined classroom:', classroom);
    return NextResponse.json(classroom, { status: 200 });
  } catch (error) {
    console.log('Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
