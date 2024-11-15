import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { marks } = body;

    if (typeof marks !== 'number' || marks < 0) {
      return NextResponse.json({ error: "Invalid marks value" }, { status: 400 });
    }

    const submissionId = params.submissionId;
    if (!submissionId) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 });
    }

    // Get the submission with all necessary relations
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: true,
        assignment: {
          include: {
            classroom: {
              include: {
                creator: true
              }
            }
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Check if the current user is the classroom creator
    if (submission.assignment.classroom.creator.id !== userId) {
      return NextResponse.json({ 
        error: "Unauthorized - Only classroom creator can grade submissions"
      }, { status: 403 });
    }

    // Start a transaction to update both submission and create notification
    const [updatedSubmission, notification] = await prisma.$transaction([
      // Update the submission marks
      prisma.submission.update({
        where: { id: submissionId },
        data: { marks }
      }),
      
      // Create a notification for the student
      prisma.notification.create({
        data: {
          message: `Your submission for "${submission.assignment.title}" has been evaluated. You received ${marks} out of ${submission.assignment.maxMarks} marks.`,
          type: "ASSIGNMENT",
          relatedId: submissionId,
          users: {
            connect: {
              id: submission.userId
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      submission: updatedSubmission,
      notification: notification
    });

  } catch (error) {
    console.error('Error in PATCH /api/submissions/[submissionId]/marks:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
