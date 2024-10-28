'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts"

// Mock data for recent assignments - more descriptive titles and realistic scoring patterns
const recentAssignments = [
  { 
    id: 1, 
    title: "Binary Trees & Heap Implementation", 
    marks: 87, 
    maxMarks: 100, 
    date: "2024-03-15" 
  },
  { 
    id: 2, 
    title: "Time Complexity Analysis Lab", 
    marks: 92, 
    maxMarks: 100, 
    date: "2024-03-12" 
  },
  { 
    id: 3, 
    title: "SQL Query Optimization Project", 
    marks: 78, 
    maxMarks: 100, 
    date: "2024-03-10" 
  },
  { 
    id: 4, 
    title: "TCP/IP Protocol Implementation", 
    marks: 85, 
    maxMarks: 100, 
    date: "2024-03-08" 
  },
]

// Mock data for attendance - more realistic fluctuations
const attendanceData = [
  { month: "Jan", percentage: 96 },
  { month: "Feb", percentage: 92 },
  { month: "Mar", percentage: 88 },
  { month: "Apr", percentage: 94 },
  { month: "May", percentage: 91 },
  { month: "Jun", percentage: 89 },
]

// Mock data for subject-wise performance - more subjects and realistic distribution
const subjectPerformance = [
  { subject: "Data Structures", score: 85 },
  { subject: "Algorithms", score: 82 },
  { subject: "Database Systems", score: 88 },
  { subject: "Computer Networks", score: 84 },
  { subject: "Operating Systems", score: 79 },
  { subject: "Web Development", score: 90 },
]

export function DashboardAnalytics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Attendance Card */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={attendanceData}>
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Assignments Card */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(assignment.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-bold">
                  {assignment.marks}/{assignment.maxMarks}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subject Performance Card */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Subject Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={subjectPerformance}>
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
