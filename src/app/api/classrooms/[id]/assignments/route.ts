import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('POST request received');
  try {
    const { userId } = await getAuth(req);
    console.log('User ID:', userId);

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, deadline } = body;
    console.log('Received data:', { title, deadline });

    const classroomId = parseInt(params.id);
    console.log('Classroom ID:', classroomId);

    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        deadline: new Date(deadline),
        creator: { connect: { id: userId } },
        classroom: { connect: { id: classroomId } },
      },
    });
    console.log('New assignment created:', newAssignment);

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error('Failed to create assignment:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ message: 'Failed to create assignment', error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET request received');
  try {
    const { userId } = await getAuth(req);
    console.log('User ID:', userId);

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const classroomId = parseInt(params.id);
    console.log('Classroom ID:', classroomId);

    const assignments = await prisma.assignment.findMany({
      where: { classroomId: classroomId },
    });
    console.log('Assignments found:', assignments.length);

    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ message: 'Failed to fetch assignments', error: (error as Error).message }, { status: 500 });
  }
}