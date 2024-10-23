import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { getAuth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { marks } = body;

    if (typeof marks !== 'number' || marks < 0) {
      return NextResponse.json({ error: "Invalid marks value" }, { status: 400 });
    }

    const submissionId = parseInt(params.submissionId);
    if (isNaN(submissionId)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 });
    }

    // Get the submission and check if the user is the assignment creator
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            creator: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.assignment.creator.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the marks
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: { marks }
    });

    return NextResponse.json({ submission: updatedSubmission });
  } catch (error) {
    console.error("[SUBMISSION_MARKS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
