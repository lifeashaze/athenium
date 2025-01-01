import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import axios from 'axios';
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; category: string } }
) {
  try {
    // 1. Get all resources for this category
    const resources = await prisma.resource.findMany({
      where: {
        classroomId: params.id,
        category: params.category === 'Uncategorized' ? null : params.category,
      },
    });

    // 2. Create a new zip file
    const zip = new JSZip();

    // 3. Download each file and add it to the zip
    await Promise.all(
      resources.map(async (resource) => {
        try {
          const response = await axios.get(resource.url, {
            responseType: 'arraybuffer',
          });
          
          // Get file extension from URL
          const extension = resource.url.split('.').pop();
          // Add file to zip
          zip.file(`${resource.title}.${extension}`, response.data);
        } catch (error) {
          console.error(`Failed to download file: ${resource.title}`, error);
        }
      })
    );

    // 4. Generate zip file
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    // 5. Send response
    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${params.category}.zip"`,
      },
    });
  } catch (error) {
    console.error('Download failed:', error);
    return NextResponse.json({ error: 'Failed to create zip file' }, { status: 500 });
  }
}
