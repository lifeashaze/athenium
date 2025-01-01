import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db'

function generateClassroomCode(): string {
  const allowedCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from(
    { length: 6 },
    () => allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length))
  ).join('');
}

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

    let classroomCode: string = generateClassroomCode();
    let isCodeUnique = false;
    while (!isCodeUnique) {
      if (!isCodeUnique) {
        const existingClassroom = await prisma.classroom.findUnique({
          where: { code: classroomCode },
        });
        if (!existingClassroom) {
          isCodeUnique = true;
        } else {
          classroomCode = generateClassroomCode();
        }
      }
    }

    const classroom = await prisma.classroom.create({
      data: {
        name: courseName,
        code: classroomCode,
        inviteLink: `https://athenium.com/join/${classroomCode}`,
        year,
        division,
        courseCode,
        courseName,
        creator: { connect: { id: user.id } },
        memberships: {
          create: {
            userId: user.id,
          },
        },
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
