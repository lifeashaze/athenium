import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'

export async function GET(
    request: Request,
    { params }: { params: { id: string; assignmentId: string } }
  ) {
  
    try {
      const classroomId = params.id;
      const assignmentId = params.assignmentId;
    
      if (!classroomId || !assignmentId) {
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
    
      return NextResponse.json(submissions);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
