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

    // Fetch recent attendances
    const attendances = await prisma.attendance.findMany({
      where: {
        userId,
        date: { gte: sevenDaysAgo }
      },
      include: {
        classroom: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 5
    })

    // Fetch recent submissions with grades
    const submissions = await prisma.submission.findMany({
      where: {
        userId,
        submittedAt: { gte: sevenDaysAgo }
      },
      include: {
        assignment: {
          include: {
            classroom: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: 5
    })

    // Transform the data into activities
    const activities = [
      ...attendances.map(attendance => ({
        id: attendance.id,
        type: 'attendance' as const,
        title: `Attended ${attendance.classroom.courseName}`,
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
        date: submission.marks > 0 ? submission.submittedAt : submission.submittedAt,
        details: {
          classroomName: submission.assignment.classroom.courseName,
          grade: submission.marks,
          maxGrade: submission.assignment.maxMarks,
          submissionStatus: new Date(submission.submittedAt) <= new Date(submission.assignment.deadline) 
            ? 'on_time' as const 
            : 'late' as const
        }
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ activities: activities.slice(0, 10) })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}