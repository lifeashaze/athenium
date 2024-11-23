'use client'

import { useState, useEffect, AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react'
import { useUser } from '@clerk/nextjs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, BookOpen, GraduationCap, FileText, Clock, Trophy, AlertTriangle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icons } from '@/components/ui/icons'


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
  role: string;
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

const yearAbbreviations: { [key: string]: string } = {
  'First Year': 'FY',
  'Second Year': 'SY',
  'Third Year': 'TY',
  'Fourth Year': 'LY'
};

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

      {/* Course-wise Summary Card */}
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

export default function UserSettingsPage() {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    role: '',
    rollNo: '',
    year: '',
    division: '',
    srn: '',
    prn: '',
    officeHoursStart: '',
    officeHoursEnd: ''
  })
  const [initialFormData, setInitialFormData] = useState({...formData})
  const [isLoading, setIsLoading] = useState(true)
  const [studentData, setStudentData] = useState<Student | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const userResponse = await fetch('/api/user')
        const userData = await userResponse.json()
        setFormData(userData)
        setInitialFormData(userData)

        const studentResponse = await fetch(`/api/students/${user?.id}`)
        if (studentResponse.ok) {
          const data = await studentResponse.json()
          setStudentData(data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (JSON.stringify(formData) === JSON.stringify(initialFormData)) {
      toast({
        title: "No Changes",
        description: "No changes were made to your settings.",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setInitialFormData(formData)
        toast({
          title: "Success",
          description: "Your settings have been updated.",
        })
      } else {
        throw new Error('Failed to update user settings')
      }
    } catch (error) {
      console.error('Error updating user settings:', error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card className="mb-6">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <Skeleton className="w-20 h-20 rounded-full" />
            ) : (
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User avatar"} />
                <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
              </Avatar>
            )}
            <div>
              {isLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <CardTitle className="text-2xl">{user?.fullName}</CardTitle>
              )}
              {isLoading ? (
                <Skeleton className="h-4 w-64 mt-2" />
              ) : (
                <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-4">
                    {['firstName', 'lastName'].map((field) => (
                      <div key={field}>
                        <Label htmlFor={field}>{field === 'firstName' ? 'First Name' : 'Last Name'}</Label>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Input id={field} value={user[field as keyof typeof user]?.toString() || ''} disabled />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Information - Show for Students */}
                {formData.role === 'STUDENT' && (
                  <div>
                    <h3 className="text-lg font-medium">Academic Information</h3>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rollNo">Roll No</Label>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Input
                            id="rollNo"
                            name="rollNo"
                            value={formData.rollNo}
                            onChange={(e) => handleInputChange('rollNo', e.target.value)}
                          />
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="year">Year</Label>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select
                            value={formData.year}
                            onValueChange={(value) => handleInputChange('year', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(yearAbbreviations).map((yearOption) => (
                                <SelectItem key={yearOption} value={yearOption}>
                                  {yearOption}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="division">Division</Label>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select
                            value={formData.division}
                            onValueChange={(value) => handleInputChange('division', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Division" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                                <SelectItem key={letter} value={letter}>
                                  {letter}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="srn">SRN</Label>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Input
                            id="srn"
                            name="srn"
                            value={formData.srn}
                            onChange={(e) => handleInputChange('srn', e.target.value)}
                          />
                        )}
                      </div>

                      <div>
                        <Label htmlFor="prn">PRN</Label>
                        {isLoading ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Input
                            id="prn"
                            name="prn"
                            value={formData.prn}
                            onChange={(e) => handleInputChange('prn', e.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Office Hours - Show for Professors */}
                {formData.role === 'PROFESSOR' && (
                  <div>
                    <h3 className="text-lg font-medium">Office Hours</h3>
                    <Separator className="my-2" />
                    <div className="flex space-x-4">
                      {['officeHoursStart', 'officeHoursEnd'].map((field) => (
                        <div key={field} className="flex-1">
                          <Label htmlFor={field}>{field === 'officeHoursStart' ? 'Start Time' : 'End Time'}</Label>
                          {isLoading ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Input
                              id={field}
                              name={field}
                              type="time"
                              value={formData[field as keyof typeof formData]}
                              onChange={(e) => handleInputChange(field as keyof typeof formData, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading || isSaving || JSON.stringify(formData) === JSON.stringify(initialFormData)}
                  >
                    {isSaving ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          {studentData && <AttendanceSection attendanceData={studentData.attendance} />}
        </TabsContent>

        <TabsContent value="performance">
          {studentData && (
            <div className="space-y-6">
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {studentData.submissions
                        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                        .map((submission) => (
                          <div 
                            key={submission.id} 
                            className="p-4 border rounded-lg space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{submission.assignment.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {submission.assignment.classroom.name}
                                </p>
                              </div>
                              <Badge variant={
                                (submission.marks / submission.assignment.maxMarks) * 100 >= 75 ? "default" :
                                (submission.marks / submission.assignment.maxMarks) * 100 >= 60 ? "secondary" :
                                "destructive"
                              }>
                                {submission.marks}/{submission.assignment.maxMarks}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
