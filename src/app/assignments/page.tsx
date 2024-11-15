"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isPast } from "date-fns"
import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Clock, ChevronRight, CheckCircle2, AlertCircle, FileCheck } from "lucide-react"

// Update type to match Prisma schema
type Assignment = {
  id: number
  title: string
  description: string
  requirements: string[]
  deadline: string
  maxMarks: number
  classroomId: number
  classroom: {
    id: number
    courseName: string
  }
  submissions: {
    submittedAt: string
  }[]
}

const Page = () => {
  const router = useRouter()
  const { userId } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignments')
        const data = await response.json()
        setAssignments(data)
      } catch (error) {
        console.error('Failed to fetch assignments:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchAssignments()
    }
  }, [userId])

  // Updated reducer to separate into three categories
  const { pendingAssignments, overdueAssignments, recentSubmissions } = assignments.reduce(
    (acc, assignment) => {
      const hasSubmission = assignment.submissions.length > 0
      const isOverdue = isPast(parseISO(assignment.deadline))

      if (hasSubmission) {
        acc.recentSubmissions.push(assignment)
      } else if (isOverdue) {
        acc.overdueAssignments.push(assignment)
      } else {
        acc.pendingAssignments.push(assignment)
      }
      return acc
    },
    { 
      pendingAssignments: [] as Assignment[], 
      overdueAssignments: [] as Assignment[],
      recentSubmissions: [] as Assignment[] 
    }
  )

  // Sort overdue assignments by most overdue first
  const sortedOverdueAssignments = overdueAssignments.sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  )

  // Sort pending assignments by earliest deadline
  const sortedPendingAssignments = pendingAssignments.sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  )

  // Sort submitted assignments by most recent submission and take only 6
  const sortedRecentSubmissions = recentSubmissions
    .sort((a, b) => 
      new Date(b.submissions[0].submittedAt).getTime() - new Date(a.submissions[0].submittedAt).getTime()
    )
    .slice(0, 6)

  const formatDeadline = (deadline: string) => {
    const date = parseISO(deadline)
    return format(date, "PPP 'at' p")
  }

  const getDeadlineStatus = (deadline: string) => {
    const dueDate = parseISO(deadline)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (isPast(dueDate)) return "Overdue"
    if (daysUntilDue <= 1) return "Due Today"
    if (daysUntilDue <= 3) return "Due Soon"
    return `Due in ${daysUntilDue} days`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <p>Loading assignments...</p>
      ) : (
        <div className="space-y-8">
          {/* Pending Assignments Section */}
          <section aria-labelledby="pending-assignments">
            <h2 id="pending-assignments" className="text-2xl font-bold mb-4">Pending Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPendingAssignments.length === 0 ? (
                <Card className="col-span-full p-6 text-center">
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2 font-medium">You&apos;re all caught up!</p>
                    <p className="text-sm text-muted-foreground">There are no pending assignments at the moment. Check back later for new assignments.</p>
                  </div>
                </Card>
              ) : (
                sortedPendingAssignments.map((assignment) => (
                  <Card key={assignment.id} className="overflow-hidden flex flex-col h-[200px]">
                    <CardHeader className="pb-2 flex-none">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{assignment.title}</CardTitle>
                          <CardDescription className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {assignment.classroom.courseName}
                          </CardDescription>
                        </div>
                        <Badge variant={isPast(parseISO(assignment.deadline)) ? "destructive" : "secondary"}>
                          {getDeadlineStatus(assignment.deadline)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 justify-between">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        Due: {formatDeadline(assignment.deadline)}
                      </div>
                      <div className="mt-auto pt-2">
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => router.push(`/classroom/${assignment.classroom.id}/assignment/${assignment.id}`)}
                        >
                          Submit Assignment
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Overdue Assignments Section */}
          <section aria-labelledby="overdue-assignments">
            <h2 id="overdue-assignments" className="text-2xl font-bold mb-4">Overdue Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedOverdueAssignments.length === 0 ? (
                <Card className="col-span-full p-6 text-center">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2 font-medium">Great job staying on track!</p>
                    <p className="text-sm text-muted-foreground">You have no overdue assignments. Keep up the good work!</p>
                  </div>
                </Card>
              ) : (
                sortedOverdueAssignments.map((assignment) => (
                  <Card key={assignment.id} className="overflow-hidden flex flex-col h-[200px]">
                    <CardHeader className="pb-2 flex-none">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{assignment.title}</CardTitle>
                          <CardDescription className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {assignment.classroom.courseName}
                          </CardDescription>
                        </div>
                        <Badge variant="destructive">Overdue</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 justify-between">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        Due: {formatDeadline(assignment.deadline)}
                      </div>
                      <div className="mt-auto pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push(`/classroom/${assignment.classroom.id}/assignment/${assignment.id}`)}
                        >
                          Request Extension
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Recent Submissions Section */}
          <section aria-labelledby="recent-submissions">
            <h2 id="recent-submissions" className="text-2xl font-bold mb-4">Recent Submissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedRecentSubmissions.length === 0 ? (
                <Card className="col-span-full p-6 text-center">
                  <div className="flex flex-col items-center">
                    <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2 font-medium">No submissions yet</p>
                    <p className="text-sm text-muted-foreground">Once you submit your assignments, they will appear here. Check your pending assignments to get started!</p>
                  </div>
                </Card>
              ) : (
                sortedRecentSubmissions.map((assignment) => (
                  <Card key={assignment.id} className="overflow-hidden flex flex-col h-[200px]">
                    <CardHeader className="pb-2 flex-none">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{assignment.title}</CardTitle>
                          <CardDescription className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {assignment.classroom.courseName}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">Submitted</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 justify-between">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        Submitted: {formatDeadline(assignment.submissions[0].submittedAt)}
                      </div>
                      <div className="mt-auto pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => router.push(`/classroom/${assignment.classroom.id}/assignment/${assignment.id}`)}
                        >
                          View Submission
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Page
