'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts"

// Mock data for recent assignments
const recentAssignments = [
  { id: 1, title: "Data Structures Quiz", marks: 22, maxMarks: 25, date: "2024-03-15" },
  { id: 2, title: "Algorithm Analysis", marks: 18, maxMarks: 20, date: "2024-03-12" },
  { id: 3, title: "Database Design", marks: 23, maxMarks: 25, date: "2024-03-10" },
  { id: 4, title: "Network Protocols", marks: 17, maxMarks: 20, date: "2024-03-08" },
]

// Mock data for attendance
const attendanceData = [
  { month: "Jan", percentage: 92 },
  { month: "Feb", percentage: 88 },
  { month: "Mar", percentage: 95 },
  { month: "Apr", percentage: 90 },
  { month: "May", percentage: 85 },
  { month: "Jun", percentage: 92 },
]

// Mock data for subject-wise performance
const subjectPerformance = [
  { subject: "Data Structures", score: 85 },
  { subject: "Algorithms", score: 78 },
  { subject: "Database", score: 92 },
  { subject: "Networks", score: 88 },
  { subject: "OS", score: 75 },
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
