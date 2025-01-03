import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${uuidv4()}-${file.name}`;

    const uploadParams = {
      Bucket: 'athenium-assignments',
      Key: fileName,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const fileUrl = `https://athenium-assignments.s3.amazonaws.com/${fileName}`;

    console.log('File uploaded to S3:', fileUrl);

    // Check for existing submission
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        userId: userId,
        assignmentId: params.assignmentId,
      },
    });

    let submission;
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: { content: fileUrl },
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          userId: userId,
          assignmentId: params.assignmentId,
          content: fileUrl,
        },
      });
    }


    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message }, { status: 500 });
  }
}