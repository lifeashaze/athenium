import { NextResponse } from 'next/server';
import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { date, updates } = body;

  if (!date || !updates || !Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'Date and valid updates array are required' }, { status: 400 });
  }

  try {
    const classroomId = params.id;
    
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { courseName: true }
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    // Process attendance updates in smaller chunks
    const CHUNK_SIZE = 10;
    const chunks = [];
    for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
      chunks.push(updates.slice(i, i + CHUNK_SIZE));
    }

    const results = [];
    for (const chunk of chunks) {
      const result = await prisma.$transaction(async (tx) => {
        // Process attendance updates
        const attendanceUpdates = await Promise.all(
          chunk.map((update: { userId: string; status: 'present' | 'absent' }) =>
            tx.attendance.upsert({
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

        // Create notifications
        const notifications = await Promise.all(
          chunk.map((update: { userId: string; status: 'present' | 'absent' }) =>
            tx.notification.create({
              data: {
                message: `Your attendance for ${classroom.courseName} on ${new Date(date).toLocaleDateString()} has been marked as ${update.status}`,
                type: NotificationType.ATTENDANCE,
                users: {
                  connect: { id: update.userId }
                }
              }
            })
          )
        );

        return { attendanceUpdates, notifications };
      }, {
        timeout: 10000 // Increase timeout to 10 seconds per chunk
      });

      results.push(result);
    }

    return NextResponse.json({ 
      message: 'Batch attendance and notifications created successfully', 
      data: results 
    });
  } catch (error) {
    console.error('Failed to update batch attendance:', error);
    return NextResponse.json({ error: 'Failed to update batch attendance' }, { status: 500 });
  }
}
