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
    
    // Get classroom details for the notification message
    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { courseName: true }
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create attendance records
      const attendanceUpdates = await Promise.all(
        updates.map((update: { userId: string; status: 'present' | 'absent' }) =>
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

      // Create notifications for each user
      const notifications = await Promise.all(
        updates.map((update: { userId: string; status: 'present' | 'absent' }) =>
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
    });

    console.log('Batch attendance updated:', result);
    return NextResponse.json({ 
      message: 'Batch attendance and notifications created successfully', 
      data: result 
    });
  } catch (error) {
    console.error('Failed to update batch attendance:', error);
    return NextResponse.json({ error: 'Failed to update batch attendance' }, { status: 500 });
  }
}
