"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, parseISO, isPast } from "date-fns"
import { useAuth } from "@clerk/nextjs"
import { Clock, ChevronRight, CheckCircle2, AlertCircle, FileCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import React from "react"

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

const AssignmentCardSkeleton = () => (
  <Card className="overflow-hidden flex flex-col h-[200px]">
    <CardHeader className="pb-2 flex-none">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" /> {/* Title */}
          <Skeleton className="h-4 w-32" /> {/* Course name */}
        </div>
        <Skeleton className="h-5 w-20" /> {/* Badge */}
      </div>
    </CardHeader>
    <CardContent className="flex flex-col flex-1 justify-between">
      <Skeleton className="h-4 w-40" /> {/* Date */}
      <div className="mt-auto pt-2">
        <Skeleton className="h-9 w-full" /> {/* Button */}
      </div>
    </CardContent>
  </Card>
);

const SectionSkeleton = () => (
  <section className="space-y-4">
    <Skeleton className="h-8 w-48" /> {/* Section title */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <AssignmentCardSkeleton key={i} />
      ))}
    </div>
  </section>
);

const Page = () => {
  const router = useRouter()
  const { userId } = useAuth()

  // Replace useState and useEffect with useQuery
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data } = await axios.get('/api/assignments')
      return data
    },
    enabled: !!userId, // Only fetch when userId is available
    staleTime: 1000 * 60, // Consider data stale after 1 minute
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  })

  // Memoize the categorized assignments to prevent unnecessary recalculations
  const { 
    pendingAssignments, 
    overdueAssignments, 
    recentSubmissions 
  } = React.useMemo(() => {
    return assignments.reduce(
      (acc: { recentSubmissions: any[]; overdueAssignments: any[]; pendingAssignments: any[] }, assignment: { submissions: string | any[]; deadline: string }) => {
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
  }, [assignments])

  // Memoize sorted assignments
  const sortedOverdueAssignments = React.useMemo(() => 
    overdueAssignments.sort((a: { deadline: string | number | Date }, b: { deadline: string | number | Date }) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    ), [overdueAssignments]
  )

  const sortedPendingAssignments = React.useMemo(() => 
    pendingAssignments.sort((a: { deadline: string | number | Date }, b: { deadline: string | number | Date }) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    ), [pendingAssignments]
  )

  const sortedRecentSubmissions = React.useMemo(() => 
    recentSubmissions
      .sort((a: { submissions: { submittedAt: string | number | Date }[] }, b: { submissions: { submittedAt: string | number | Date }[] }) => 
        new Date(b.submissions[0].submittedAt).getTime() - 
        new Date(a.submissions[0].submittedAt).getTime()
      )
      .slice(0, 6), 
    [recentSubmissions]
  )

  // Memoize utility functions
  const formatDeadline = React.useCallback((deadline: string) => {
    const date = parseISO(deadline)
    return format(date, "PPP 'at' p")
  }, [])

  const getDeadlineStatus = React.useCallback((deadline: string) => {
    const dueDate = parseISO(deadline)
    const now = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (isPast(dueDate)) return "Overdue"
    if (daysUntilDue <= 1) return "Due Today"
    if (daysUntilDue <= 3) return "Due Soon"
    return `Due in ${daysUntilDue} days`
  }, [])

  // Prefetch individual assignment pages
  React.useEffect(() => {
    [...sortedPendingAssignments, ...sortedOverdueAssignments].forEach(assignment => {
      router.prefetch(`/classroom/${assignment.classroom.id}/assignment/${assignment.id}`)
    })
  }, [sortedPendingAssignments, sortedOverdueAssignments, router])

  // Create reusable assignment card component to reduce code duplication
  const AssignmentCard = React.memo(({ 
    assignment, 
    variant = 'pending' 
  }: { 
    assignment: Assignment, 
    variant?: 'pending' | 'overdue' | 'submitted' 
  }) => (
    <Card className="overflow-hidden flex flex-col h-[200px]">
      <CardHeader className="pb-2 flex-none">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg line-clamp-1">{assignment.title}</CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {assignment.classroom.courseName}
            </CardDescription>
          </div>
          <Badge 
            variant={
              variant === 'overdue' 
                ? "destructive" 
                : variant === 'submitted' 
                  ? "secondary" 
                  : isPast(parseISO(assignment.deadline)) 
                    ? "destructive" 
                    : "secondary"
            }
          >
            {variant === 'submitted' 
              ? "Submitted" 
              : getDeadlineStatus(assignment.deadline)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-between">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4 mr-1" />
          {variant === 'submitted' 
            ? `Submitted: ${formatDeadline(assignment.submissions[0].submittedAt)}`
            : `Due: ${formatDeadline(assignment.deadline)}`}
        </div>
        <div className="mt-auto pt-2">
          <Button 
            size="sm" 
            variant={variant === 'overdue' ? "outline" : "default"}
            className="w-full"
            onClick={() => router.push(`/classroom/${assignment.classroom.id}/assignment/${assignment.id}`)}
          >
            {variant === 'overdue' 
              ? 'Request Extension'
              : variant === 'submitted'
                ? 'View Submission'
                : 'Submit Assignment'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  ))

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading ? (
        <div className="space-y-8">
          <SectionSkeleton /> {/* Pending Assignments */}
          <SectionSkeleton /> {/* Overdue Assignments */}
          <SectionSkeleton /> {/* Recent Submissions */}
        </div>
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
                sortedPendingAssignments.map((assignment: Assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} variant="pending" />
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
                sortedOverdueAssignments.map((assignment: Assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} variant="overdue" />
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
                sortedRecentSubmissions.map((assignment: Assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} variant="submitted" />
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
