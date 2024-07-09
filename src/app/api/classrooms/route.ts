import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Handle GET request
export async function GET(req: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// Handle POST request
export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url);

  if (pathname.endsWith('/create')) {
    return await createClassroom(req);
  } else if (pathname.endsWith('/join')) {
    return await joinClassroom(req);
  }

  return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
}

// Function to handle classroom creation
async function createClassroom(req: NextRequest) {
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

// Function to handle joining a classroom
async function joinClassroom(req: NextRequest) {
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
        userId,
        classroomId: classroom.id,
      },
    });

    console.log('Joined classroom:', classroom);
    return NextResponse.json({ message: 'Successfully joined the classroom' }, { status: 200 });
  } catch (error) {
    console.log('Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}