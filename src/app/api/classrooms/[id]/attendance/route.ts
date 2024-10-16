import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    const classroomId = parseInt(params.id);
    const attendance = await prisma.attendance.findMany({
      where: {
        classroomId,
        date: new Date(date),
      },
      select: {
        userId: true,
        isPresent: true,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { date, attendance } = body;

  if (!date || !attendance || !Array.isArray(attendance)) {
    return NextResponse.json({ error: 'Date and valid attendance array are required' }, { status: 400 });
  }

  try {
    const classroomId = parseInt(params.id);
    const result = await prisma.$transaction(
      attendance.map((record: { userId: string; isPresent: boolean }) =>
        prisma.attendance.upsert({
          where: {
            userId_classroomId_date: {
              userId: record.userId,
              classroomId,
              date: new Date(date),
            },
          },
          update: { isPresent: record.isPresent },
          create: {
            userId: record.userId,
            classroomId,
            date: new Date(date),
            isPresent: record.isPresent,
          },
        })
      )
    );

    console.log('Attendance saved:', result);
    return NextResponse.json({ message: 'Attendance saved successfully', data: result });
  } catch (error) {
    console.error('Failed to save attendance:', error);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}