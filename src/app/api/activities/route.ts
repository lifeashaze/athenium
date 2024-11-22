import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Fetch recent activities (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Fetch all data in parallel
    const [attendances, submissions] = await Promise.all([
      // Fetch recent attendances
      prisma.attendance.findMany({
        where: {
          userId,
          date: { gte: sevenDaysAgo }
        },
        include: {
          classroom: {
            select: {
              courseName: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        take: 10
      }),

      // Fetch recent submissions with grades
      prisma.submission.findMany({
        where: {
          userId,
          submittedAt: { gte: sevenDaysAgo }
        },
        include: {
          assignment: {
            select: {
              title: true,
              deadline: true,
              maxMarks: true,
              classroom: {
                select: {
                  courseName: true
                }
              }
            }
          }
        },
        orderBy: {
          submittedAt: 'desc'
        },
        take: 10
      })
    ]);

    // Transform the data into activities
    const activities = [
      ...attendances.map(attendance => ({
        id: attendance.id,
        type: 'attendance' as const,
        title: `${attendance.isPresent ? 'Attended' : 'Missed'} ${attendance.classroom.courseName}`,
        date: attendance.date,
        details: {
          classroomName: attendance.classroom.courseName,
          status: attendance.isPresent ? 'present' as const : 'absent' as const
        }
      })),
      ...submissions.map(submission => ({
        id: submission.id,
        type: submission.marks > 0 ? 'grade' as const : 'submission' as const,
        title: submission.marks > 0 
          ? `Received grade for ${submission.assignment.title}`
          : `Submitted ${submission.assignment.title}`,
        date: submission.submittedAt,
        details: {
          classroomName: submission.assignment.classroom.courseName,
          grade: submission.marks,
          maxGrade: submission.assignment.maxMarks,
          submissionStatus: new Date(submission.submittedAt) <= new Date(submission.assignment.deadline) 
            ? 'on_time' as const 
            : 'late' as const
        }
      }))
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}