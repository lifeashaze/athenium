import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'

export async function GET(
    request: Request,
    { params }: { params: { id: string; assignmentId: string } }
  ) {
    console.log('Received params:', params);
  
    try {
      const classroomId = params.id;
      const assignmentId = params.assignmentId;
  
      console.log('Using IDs:', { classroomId, assignmentId });
  
      if (!classroomId || !assignmentId) {
        console.log('Invalid IDs:', { classroomId, assignmentId });
        return NextResponse.json({ error: 'Invalid classroom or assignment ID' }, { status: 400 });
      }
  
      const submissions = await prisma.submission.findMany({
        where: {
          assignmentId: assignmentId,
          assignment: {
            classroomId: classroomId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              rollNo: true,
              srn: true,
              prn: true,
            },
          },
        },
      });
  
      console.log('Submissions found:', submissions.length);
  
      return NextResponse.json(submissions);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
