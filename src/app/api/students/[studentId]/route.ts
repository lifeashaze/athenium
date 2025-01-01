import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db'

const ITEMS_PER_PAGE = 10; // For attendance pagination

export async function GET(
  req: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Execute main queries in parallel
    const [student, attendanceRecords, classroomAttendance, presentCounts, classroomDetails] = 
      await Promise.all([
        prisma.user.findUnique({
          where: { id: params.studentId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            year: true,
            division: true,
            srn: true,
            prn: true,
            submissions: {
              select: {
                id: true,
                submittedAt: true,
                marks: true,
                assignment: {
                  select: {
                    title: true,
                    maxMarks: true,
                    deadline: true,
                    classroom: {
                      select: {
                        name: true,
                        courseCode: true
                      }
                    }
                  }
                }
              },
              orderBy: { submittedAt: 'desc' }
            },
            memberships: {
              select: {
                classroom: {
                  select: {
                    id: true,
                    name: true,
                    courseCode: true
                  }
                }
              }
            }
          }
        }),
        // Simplified attendance query - remove pagination if not necessary
        prisma.attendance.findMany({
          where: { userId: params.studentId },
          include: {
            classroom: {
              select: {
                id: true,
                name: true,
                courseCode: true
              }
            }
          },
          orderBy: { date: 'desc' }
        }),
        prisma.attendance.groupBy({
          by: ['classroomId'],
          where: { userId: params.studentId },
          _count: { _all: true }
        }),
        prisma.attendance.groupBy({
          by: ['classroomId'],
          where: {
            userId: params.studentId,
            isPresent: true
          },
          _count: { _all: true }
        }),
        prisma.classroom.findMany({
          where: {
            id: {
              in: (await prisma.attendance.groupBy({
                by: ['classroomId'],
                where: { userId: params.studentId }
              })).map(ca => ca.classroomId)
            }
          },
          select: {
            id: true,
            courseCode: true,
            courseName: true
          }
        })
    ]);

    if (!student) {
      return new NextResponse("Student not found", { status: 404 });
    }

    // Calculate overall attendance percentage
    const overallAttendance = {
      total: classroomAttendance.reduce((sum, curr) => sum + curr._count._all, 0),
      present: presentCounts.reduce((sum, curr) => sum + curr._count._all, 0)
    };

    // Calculate performance metrics
    const submissionStats = student.submissions.reduce((stats, sub) => {
      const isLate = new Date(sub.submittedAt) > new Date(sub.assignment.deadline);
      return {
        totalSubmissions: stats.totalSubmissions + 1,
        onTimeSubmissions: stats.onTimeSubmissions + (isLate ? 0 : 1),
        totalMarks: stats.totalMarks + sub.marks,
        maxPossibleMarks: stats.maxPossibleMarks + sub.assignment.maxMarks
      };
    }, {
      totalSubmissions: 0,
      onTimeSubmissions: 0,
      totalMarks: 0,
      maxPossibleMarks: 0
    });

    // Map the attendance data with correct present counts
    const byClassroom = classroomAttendance.map(ca => {
      const presentRecord = presentCounts.find(pc => pc.classroomId === ca.classroomId);
      const presentCount = presentRecord ? presentRecord._count._all : 0;
      const classroom = classroomDetails.find(c => c.id === ca.classroomId);
      
      return {
        classroomId: ca.classroomId,
        courseCode: classroom?.courseCode || '',
        courseName: classroom?.courseName || '',
        total: ca._count._all,
        present: presentCount,
        percentage: ca._count._all > 0 
          ? (presentCount / ca._count._all) * 100 
          : 0
      };
    });

    const formattedResponse = {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      year: student.year,
      division: student.division,
      srn: student.srn,
      prn: student.prn,
      performance: {
        submissions: {
          total: submissionStats.totalSubmissions,
          onTime: submissionStats.onTimeSubmissions,
          percentage: submissionStats.maxPossibleMarks > 0
            ? (submissionStats.totalMarks / submissionStats.maxPossibleMarks) * 100
            : 0
        }
      },
      attendance: {
        overall: {
          total: overallAttendance.total,
          present: overallAttendance.present,
          percentage: overallAttendance.total > 0
            ? (overallAttendance.present / overallAttendance.total) * 100
            : 0
        },
        byClassroom: byClassroom,
        records: {
          data: attendanceRecords  // All records, no limit
        }
      },
      memberships: student.memberships,
      submissions: student.submissions
    };

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('[STUDENT_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}