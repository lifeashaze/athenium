import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { date, updates } = body;

  if (!date || !updates || !Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'Date and valid updates array are required' }, { status: 400 });
  }

  try {
    const classroomId = params.id;
    const result = await prisma.$transaction(
      updates.map((update: { userId: string; status: 'present' | 'absent' }) =>
        prisma.attendance.upsert({
          where: {
            userId_classroomId_date: {
              userId: update.userId,
              classroomId,
              date: new Date(date),
            },
          },
          update: { isPresent: update.status === 'present' },
          create: {
            userId: update.userId,
            classroomId,
            date: new Date(date),
            isPresent: update.status === 'present',
          },
        })
      )
    );

    console.log('Batch attendance updated:', result);
    return NextResponse.json({ message: 'Batch attendance updated successfully', data: result });
  } catch (error) {
    console.error('Failed to update batch attendance:', error);
    return NextResponse.json({ error: 'Failed to update batch attendance' }, { status: 500 });
  }
}
