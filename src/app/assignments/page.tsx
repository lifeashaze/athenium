"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Define the Assignment type
type Assignment = {
  id: string
  title: string
  subject: string
  deadline: string
  submitted: boolean
}

const assignments: Assignment[] = [
    {
        id: "1",
        title: "Write a simple program to print 'Hello, World!'",
        subject: "Introduction to Computer Programming",
        deadline: "20th August, 2024 11:59 PM",
        submitted: false
    }
]

const Page = () => {
  const router = useRouter()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Assignments</h1>
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <CardTitle>{assignment.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{assignment.subject}</p>
              <p className="text-sm text-gray-500">Due: {assignment.deadline}</p>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <Badge variant={assignment.submitted ? "secondary" : "outline"}>
                  {assignment.submitted ? 'Submitted' : 'Not Submitted'}
                </Badge>
                <Button onClick={() => router.push(`/assignment/${assignment.id}`)}>
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Page
