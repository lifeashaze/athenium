'use client';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, BookOpen, GraduationCap, FileText, Clock, Download, Trophy, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ProfileSkeleton, 
  PerformanceCardSkeleton, 
  CoursesSkeleton, 
  SubmissionsSkeleton, 
  AttendanceAlertsSkeleton 
} from "@/components/loaders/StudentProfileLoaders";
import { StudentChatBot } from '@/components/classroom/StudentChatBot';

interface AttendanceRecord {
  id: string;
  date: string;
  isPresent: boolean;
  classroom: {
    id: string;
    name: string;
    courseCode: string;
  };
}

interface CourseAttendance {
  classroomId: string;
  courseName: string;
  courseCode: string;
  percentage: number;
  present: number;
  total: number;
}

interface AttendanceData {
  overall: {
    percentage: number;
    present: number;
    total: number;
  };
  byClassroom: CourseAttendance[];
  records: {
    data: AttendanceRecord[];
  };
}

interface Student {
  firstName: string;
  lastName: string;
  year: string;
  division: string;
  srn: string;
  prn: string;
  email: string;
  performance: {
    submissions: {
      percentage: number;
      onTime: number;
      total: number;
    };
  };
  attendance: AttendanceData;
  memberships: Array<{
    classroom: {
      name: string;
      courseCode: string;
    };
  }>;
  submissions: Array<{
    id: string;
    assignment: {
      title: string;
      maxMarks: number;
      deadline: string;
      classroom: {
        name: string;
        courseCode: string;
      };
    };
    marks: number;
    submittedAt: string;
  }>;
}

const AttendanceSection = ({ attendanceData }: { attendanceData: AttendanceData }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("overall");

  const getAttendanceDisplay = () => {
    if (selectedCourse === "overall") {
      return {
        title: "Overall Attendance",
        percentage: attendanceData.overall.percentage,
        present: attendanceData.overall.present,
        total: attendanceData.overall.total,
      };
    }

    const courseData = attendanceData.byClassroom.find(
      (course) => course.classroomId === selectedCourse
    );

    if (!courseData) {
      return {
        title: "Overall Attendance",
        percentage: attendanceData.overall.percentage,
        present: attendanceData.overall.present,
        total: attendanceData.overall.total,
      };
    }

    return {
      title: courseData.courseName,
      percentage: courseData.percentage,
      present: courseData.present,
      total: courseData.total,
    };
  };

  const attendanceDisplay = getAttendanceDisplay();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance Details</CardTitle>
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall Attendance</SelectItem>
                {attendanceData.byClassroom
                  .sort((a, b) => a.courseName.localeCompare(b.courseName))
                  .map((course) => (
                    <SelectItem key={course.classroomId} value={course.classroomId}>
                      {course.courseName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">{attendanceDisplay.title}</h3>
              <Progress 
                value={attendanceDisplay.percentage} 
                className="h-4" 
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {attendanceDisplay.percentage.toFixed(1)}% Present
                ({attendanceDisplay.present}/{attendanceDisplay.total} Classes)
              </p>
            </div>

            {selectedCourse !== "overall" && (
              <div className="pt-6 border-t">
                <h4 className="text-sm font-medium mb-3">Attendance History</h4>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {attendanceData.records.data
                      .filter(record => 
                        selectedCourse === "overall" || record.classroom.id === selectedCourse
                      )
                      .map((record) => (
                        <div 
                          key={record.id} 
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${
                              record.isPresent ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="text-sm font-medium">
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {record.classroom.name} ({record.classroom.courseCode})
                              </p>
                            </div>
                          </div>
                          <Badge variant={record.isPresent ? "default" : "destructive"}>
                            {record.isPresent ? 'Present' : 'Absent'}
                          </Badge>
                        </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optional: Summary Card showing all courses in a grid */}
      <Card>
        <CardHeader>
          <CardTitle>Course-wise Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {attendanceData.byClassroom
              .sort((a, b) => b.percentage - a.percentage)
              .map((course) => (
                <div 
                  key={course.classroomId} 
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => setSelectedCourse(course.classroomId)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{course.courseName}</h4>
                      <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                    </div>
                    <Badge variant={course.percentage >= 75 ? "default" : "destructive"}>
                      {course.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={course.percentage} className="h-2 mt-2" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function StudentPage({ params }: { params: { studentId: string } }) {
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`/api/students/${params.studentId}`);
        if (!response.ok) throw new Error('Failed to fetch student data');
        const data = await response.json();
        setStudentData(data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [params.studentId]);

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <ProfileSkeleton />
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <PerformanceCardSkeleton />
              <PerformanceCardSkeleton />
              <CoursesSkeleton />
              <SubmissionsSkeleton />
              <AttendanceAlertsSkeleton />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
  if (!studentData) return <div>Student not found</div>;

  return (
    <div className="container py-8 space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 bg-card p-4 md:p-6 rounded-lg shadow-sm">
        <Avatar className="h-20 w-20 md:h-24 md:w-24">
          <AvatarImage src="" />
          <AvatarFallback className="text-xl md:text-2xl">
            {studentData.firstName[0]}{studentData.lastName[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2 md:space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold">
            {studentData.firstName} {studentData.lastName}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              <GraduationCap className="mr-1 h-3 w-3" />
              {studentData.year}
            </Badge>
            <Badge variant="outline">Division {studentData.division}</Badge>
            <Badge variant="outline">SRN: {studentData.srn}</Badge>
            <Badge variant="outline">PRN: {studentData.prn}</Badge>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">{studentData.email}</p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Performance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Academic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">
                        {studentData.performance.submissions.percentage.toFixed(1)}%
                      </div>
                      <Badge variant={
                        studentData.performance.submissions.percentage >= 75 ? "default" : 
                        studentData.performance.submissions.percentage >= 60 ? "secondary" : 
                        "destructive"
                      }>
                        {studentData.performance.submissions.percentage >= 75 ? "Excellent" :
                         studentData.performance.submissions.percentage >= 60 ? "Good" :
                         "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={studentData.performance.submissions.percentage} 
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">On-time Submissions</p>
                      <p className="text-xl font-semibold">
                        {studentData.performance.submissions.onTime}/{studentData.performance.submissions.total}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Submission Rate</p>
                      <p className="text-xl font-semibold">
                        {((studentData.performance.submissions.onTime / 
                          studentData.performance.submissions.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Attendance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Overall Attendance</p>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">
                        {studentData.attendance.overall.percentage.toFixed(1)}%
                      </div>
                      <Badge variant={
                        studentData.attendance.overall.percentage >= 75 ? "default" : 
                        studentData.attendance.overall.percentage >= 60 ? "secondary" : 
                        "destructive"
                      }>
                        {studentData.attendance.overall.percentage >= 75 ? "Good Standing" :
                         studentData.attendance.overall.percentage >= 60 ? "Warning" :
                         "Critical"}
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={studentData.attendance.overall.percentage} 
                    className="h-2"
                  />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Present Days</p>
                      <p className="text-xl font-semibold">
                        {studentData.attendance.overall.present}/{studentData.attendance.overall.total}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Absent Days</p>
                      <p className="text-xl font-semibold">
                        {studentData.attendance.overall.total - studentData.attendance.overall.present}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrolled Courses Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                    <p className="text-2xl font-bold">{studentData.memberships.length}</p>
                  </div>
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2">
                      {studentData.memberships.map((membership, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 text-sm bg-muted rounded"
                        >
                          <span>{membership.classroom.name}</span>
                          <span className="text-muted-foreground">{membership.classroom.courseCode}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4">
                    {studentData.submissions.slice(0, 5).map((submission) => (
                      <div 
                        key={submission.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{submission.assignment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {submission.assignment.classroom.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              (submission.marks / submission.assignment.maxMarks) * 100 >= 75 ? "default" :
                              (submission.marks / submission.assignment.maxMarks) * 100 >= 60 ? "secondary" :
                              "destructive"
                            }>
                              {submission.marks}/{submission.assignment.maxMarks}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Attendance Warnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Attendance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {studentData.attendance.byClassroom
                      .filter(course => course.percentage < 75)
                      .sort((a, b) => a.percentage - b.percentage)
                      .map((course) => (
                        <div 
                          key={course.classroomId}
                          className="p-3 bg-muted rounded-lg space-y-2"
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{course.courseName}</p>
                            <Badge variant="destructive">
                              {course.percentage.toFixed(1)}%
                            </Badge>
                          </div>
                          <Progress value={course.percentage} className="h-1" />
                          <p className="text-sm text-muted-foreground">
                            Requires {Math.ceil((75 * course.total - 100 * course.present) / 25)} more classes
                          </p>
                        </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="mt-6">
          <AttendanceSection attendanceData={studentData.attendance} />
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {studentData.memberships.map((membership, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{membership.classroom.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {membership.classroom.courseCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Assignment Submissions
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Submissions: {studentData.submissions.length}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] md:h-[600px]">
                <div className="space-y-3 md:space-y-4">
                  {studentData.submissions
                    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                    .map((submission) => (
                      <div 
                        key={submission.id} 
                        className="p-3 md:p-4 border rounded-lg space-y-2 md:space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-base">
                              {submission.assignment.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {submission.assignment.classroom.name} ({submission.assignment.classroom.courseCode})
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4" />
                              <span className="text-lg font-bold">
                                {submission.marks}/{submission.assignment.maxMarks}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {((submission.marks / submission.assignment.maxMarks) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          {new Date(submission.submittedAt) > new Date(submission.assignment.deadline) && (
                            <Badge variant="destructive">Late Submission</Badge>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {studentData && <StudentChatBot studentData={studentData} />}
    </div>
  );
}