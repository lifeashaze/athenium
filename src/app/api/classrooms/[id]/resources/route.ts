import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const classroomId = params.id;
    const resources = await prisma.resource.findMany({
      where: { classroomId },
      orderBy: { uploadedAt: 'desc' },
      include: { uploader: true },
    });

    return NextResponse.json(resources);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch resources', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const classroomId = params.id;
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('parentId') as string | null;
    const customFileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${customFileName}.${fileExtension}`;

    // Check if S3 bucket name is set
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 });
    }

    // Upload to S3
    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    }));

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Save resource info to database with custom title
    const resource = await prisma.resource.create({
      data: {
        title: customFileName,
        url: fileUrl,
        uploaderId: userId,
        classroomId,
        category: category || null,
      },
      include: {
        uploader: true,
      }
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Failed to upload resource:', error);
    return NextResponse.json({ error: 'Failed to upload resource', details: (error as Error).message }, { status: 500 });
  }
}
