"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

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
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Assignments</h1>
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{assignment.title}</h2>
                    <p className="text-gray-600">{assignment.subject}</p>
                    <p className="text-sm text-gray-500">Due: {assignment.deadline}</p>
                    <p className={`text-sm ${assignment.submitted ? 'text-green-500' : 'text-red-500'}`}>
                      {assignment.submitted ? 'Submitted' : 'Not Submitted'}
                    </p>
                  </div>
                  <Button onClick={() => router.push(`/assignment/${assignment.id}`)}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Page