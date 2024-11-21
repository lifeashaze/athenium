import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Get pagination params for attendance
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const classroomId = searchParams.get('classroomId'); // Optional: for filtering attendance by classroom

    const student = await prisma.user.findUnique({
      where: {
        id: params.studentId,
      },
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
          orderBy: {
            submittedAt: 'desc'
          }
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
    });

    if (!student) {
      return new NextResponse("Student not found", { status: 404 });
    }

    // Get attendance data with classroom-wise grouping and pagination
    const attendanceWhere = {
      userId: params.studentId,
      ...(classroomId ? { classroomId } : {})
    };

    // Get total attendance count for pagination
    const totalAttendanceCount = await prisma.attendance.count({
      where: attendanceWhere
    });

    // Get paginated attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: attendanceWhere,
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            courseCode: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE
    });

    // Calculate classroom-wise attendance
    const classroomAttendance = await prisma.attendance.groupBy({
      by: ['classroomId'],
      where: {
        userId: params.studentId
      },
      _count: {
        _all: true
      }
    });

    // Get the actual present count separately
    const presentCounts = await prisma.attendance.groupBy({
      by: ['classroomId'],
      where: {
        userId: params.studentId,
        isPresent: true
      },
      _count: {
        _all: true
      }
    });

    // Calculate overall attendance percentage
    const overallAttendance = {
      total: classroomAttendance.reduce((sum, curr) => sum + curr._count._all, 0),
      present: presentCounts.reduce((sum, curr) => sum + curr._count._all, 0)
    };

    // Get classroom details for attendance data
    const classroomDetails = await prisma.classroom.findMany({
      where: {
        id: {
          in: classroomAttendance.map(ca => ca.classroomId)
        }
      },
      select: {
        id: true,
        courseCode: true,
        courseName: true
      }
    });

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

    // Get all attendance records
    const records = await prisma.attendance.findMany({
      where: {
        userId: params.studentId,
      },
      orderBy: {
        date: 'desc'  // Most recent first
      },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            courseCode: true
          }
        }
      }
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
          data: records  // All records, no limit
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