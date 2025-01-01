import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "@clerk/nextjs/server";
import JSZip from 'jszip';
import axios from 'axios';
import { prisma } from '@/lib/db'


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const classroomId = searchParams.get('classroomId');
  const step = searchParams.get('step');

  if (action === 'download' && classroomId) {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      // Step 1: Fetch resources
      if (step === 'prepare') {
        const resources = await prisma.resource.findMany({
          where: {
            classroomId: classroomId,
            classroom: {
              memberships: {
                some: {
                  userId: userId
                }
              }
            }
          },
        });
        
        return NextResponse.json({ 
          status: 'prepared', 
          count: resources.length 
        });
      }

      // Step 2: Create and return zip file
      const resources = await prisma.resource.findMany({
        where: {
          classroomId: classroomId,
          classroom: {
            memberships: {
              some: {
                userId: userId
              }
            }
          }
        },
      });

      const zip = new JSZip();
      let downloadedCount = 0;

      // Download and add each file to the zip
      await Promise.all(
        resources.map(async (resource) => {
          try {
            const response = await axios.get(resource.url, {
              responseType: 'arraybuffer',
            });
            
            const extension = resource.url.split('.').pop();
            zip.file(`${resource.title}.${extension}`, response.data);
            downloadedCount++;
          } catch (error) {
            console.error(`Failed to download file: ${resource.title}`, error);
          }
        })
      );

      const zipContent = await zip.generateAsync({ 
        type: 'nodebuffer',
        compression: "DEFLATE",
        compressionOptions: {
          level: 5
        }
      });

      return new NextResponse(zipContent, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="classroom-resources.zip"`,
          'X-Total-Files': resources.length.toString(),
          'X-Downloaded-Files': downloadedCount.toString(),
        },
      });
    } catch (error) {
      console.error('Download failed:', error);
      return NextResponse.json({ error: 'Failed to create zip file' }, { status: 500 });
    }
  }

  // Original GET logic for fetching resources
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First, get all classrooms where the user is a member
    const classrooms = await prisma.classroom.findMany({
      where: {
        memberships: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        resources: {
          include: {
            uploader: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        }
      }
    });

    // Check if there are any classrooms
    if (classrooms.length === 0) {
      return NextResponse.json({ 
        message: "You are not a member of any classrooms yet",
        classrooms: [] 
      });
    }

    // Check if there are any resources across all classrooms
    const totalResources = classrooms.reduce((sum, classroom) => 
      sum + classroom.resources.length, 0);

    if (totalResources === 0) {
      return NextResponse.json({ 
        message: "No resources have been uploaded to your classrooms yet",
        classrooms: [] 
      });
    }

    // Transform the data into the desired format
    const formattedClassrooms = classrooms.map(classroom => ({
      id: classroom.id,
      name: classroom.name,
      courseCode: classroom.courseCode,
      courseName: classroom.courseName,
      year: classroom.year,
      division: classroom.division,
      resources: classroom.resources.map(resource => ({
        id: resource.id,
        title: resource.title,
        category: resource.category,
        uploadedAt: resource.uploadedAt,
        uploader: resource.uploader
      }))
    }));

    return NextResponse.json({
      classrooms: formattedClassrooms
    });

  } catch (error) {
    console.error('[RESOURCES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}