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

  const { year, division, courseCode, courseName } = await req.json();

  if (!year || !division || !courseCode || !courseName) {
    console.log('Bad request: Missing required fields');
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const classroom = await prisma.classroom.create({
      data: {
        name: courseName,
        code: uuidv4(),
        inviteLink: `https://athenium.com/join/${uuidv4()}`,
        year,
        division,
        courseCode,
        courseName,
        admin: { connect: { id: user.id } },
      },
    });

    console.log('Classroom created:', classroom);
    return NextResponse.json(classroom, { status: 201 });
  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}