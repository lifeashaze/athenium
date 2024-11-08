import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; resourceId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the resource to find the S3 file key
    const resource = await prisma.resource.findUnique({
      where: { id: params.resourceId },
    });

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Delete from S3
    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const fileKey = resource.url.split('/').pop();
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileKey!,
    }));

    // Delete from database
    await prisma.resource.delete({
      where: { id: params.resourceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete resource:', error);
    return NextResponse.json({ error: 'Failed to delete resource', details: (error as Error).message }, { status: 500 });
  }
}