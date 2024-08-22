import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Here you would handle the file upload to your storage solution (e.g., AWS S3)
    // For now, we'll just create a submission record without actual file content

    const submission = await prisma.submission.create({
      data: {
        userId: userId,
        assignmentId: parseInt(params.assignmentId),
        content: 'File submitted successfully', // This would be the file URL in a real implementation
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}