import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  console.log('Received request at /api/classrooms/create');

  const { userId } = getAuth(req);

  if (!userId) {
    console.log('Unauthorized: No user ID found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await req.json();

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const classroom = await prisma.classroom.create({
      data: {
        name,
        code: uuidv4(),
        inviteLink: `https://yourdomain.com/join/${uuidv4()}`,
        admin: { connect: { id: user.id } },
      },
    });

    console.log('Classroom created:', classroom);
    return NextResponse.json(classroom, { status: 201 });
  } catch (error) {
    console.log('Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
