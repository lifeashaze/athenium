import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  console.log('Received request at /api/classrooms/join');

  const { userId } = getAuth(req);

  if (!userId) {
    console.log('Unauthorized: No user ID found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  // Handle both direct classroom ID and invite code
  const classroomId = body.id;
  const code = body.code;

  try {
    let classroom;
    
    if (classroomId) {
      // Direct join via classroom ID
      classroom = await prisma.classroom.findUnique({ where: { id: classroomId } });
    } else if (code) {
      // Join via invite code
      classroom = await prisma.classroom.findUnique({ where: { code } });
    } else {
      console.log('Invalid request: Missing classroom ID or code');
      return NextResponse.json({ error: 'Invalid request: Missing classroom ID or code' }, { status: 400 });
    }

    if (!classroom) {
      console.log('Classroom not found');
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Check if the user is already a member
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_classroomId: {
          userId: userId,
          classroomId: classroom.id,
        },
      },
    });

    if (existingMembership) {
      console.log('User is already a member of this classroom');
      return NextResponse.json({ message: 'You are already a member of this classroom', classroom }, { status: 200 });
    }

    // Create the membership
    await prisma.membership.create({
      data: {
        user: { connect: { id: userId } },
        classroom: { connect: { id: classroom.id } },
      },
    });

    console.log('Joined classroom:', classroom);
    return NextResponse.json({ message: 'Successfully joined the classroom', classroom }, { status: 200 });
  } catch (error) {
    console.error('Internal server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
