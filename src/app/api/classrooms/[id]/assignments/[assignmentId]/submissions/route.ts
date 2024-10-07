import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: Request,
    { params }: { params: { id: string; assignmentId: string } }
  ) {
    console.log('Received params:', params);
  
    try {
      const classroomId = parseInt(params.id);
      const assignmentId = parseInt(params.assignmentId);
  
      console.log('Parsed IDs:', { classroomId, assignmentId });
  
      if (isNaN(classroomId) || isNaN(assignmentId)) {
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
              firstName: true,
              email: true,
            },
          },
        },
      });
  
      console.log('Submissions found:', submissions.length);
  
      return NextResponse.json(submissions);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }
  }