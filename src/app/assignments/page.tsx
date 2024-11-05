"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format, parseISO, isPast } from "date-fns"
import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"

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

  // Separate pending and submitted assignments
  const { pendingAssignments, recentSubmissions } = assignments.reduce(
    (acc, assignment) => {
      const hasSubmission = assignment.submissions.length > 0
      if (hasSubmission) {
        acc.recentSubmissions.push(assignment)
      } else {
        acc.pendingAssignments.push(assignment)
      }
      return acc
    },
    { 
      pendingAssignments: [] as Assignment[], 
      recentSubmissions: [] as Assignment[] 
    }
  )

  // Sort pending assignments by earliest deadline
  const sortedPendingAssignments = pendingAssignments.sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  )

  // Sort submitted assignments by most recent submission and take only 2
  const sortedRecentSubmissions = recentSubmissions
    .sort((a, b) => 
      new Date(b.submissions[0].submittedAt).getTime() - new Date(a.submissions[0].submittedAt).getTime()
    )
    .slice(0, 2)

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
        <>
          {/* Pending Assignments Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Pending Assignments</h2>
            <div className="space-y-4">
              {sortedPendingAssignments.length === 0 ? (
                <p className="text-muted-foreground">No pending assignments</p>
              ) : (
                sortedPendingAssignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{assignment.title}</CardTitle>
                        <Badge 
                          variant={isPast(parseISO(assignment.deadline)) ? "destructive" : "secondary"}
                        >
                          {getDeadlineStatus(assignment.deadline)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{assignment.classroom.courseName}</p>
                      <p className="text-sm text-gray-500">Due: {formatDeadline(assignment.deadline)}</p>
                      <Separator className="my-2" />
                      <div className="flex justify-end">
                        <Button onClick={() => router.push(`/classroom/${assignment.classroom.id}/assignment/${assignment.id}`)}>
                          Open Assignment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Recent Submissions Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Submissions</h2>
            <div className="space-y-4">
              {sortedRecentSubmissions.length === 0 ? (
                <p className="text-muted-foreground">No recent submissions</p>
              ) : (
                sortedRecentSubmissions.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <CardTitle>{assignment.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{assignment.classroom.courseName}</p>
                      <p className="text-sm text-gray-500">
                        Submitted: {formatDeadline(assignment.submissions[0].submittedAt)}
                      </p>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary">Submitted</Badge>
                        <Button 
                          variant="outline"
                          onClick={() => router.push(`/classroom/${assignment.classroom.id}/assignment/${assignment.id}`)}
                        >
                          View Submission
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default Page
