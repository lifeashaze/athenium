import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Submission {
  marks: number;
  submittedAt: string;
  assignment: {
    title: string;
    maxMarks: number;
  };
}

interface GradesTabProps {
  submissions: Submission[];
  assignments: any[]; // TODO: Add proper type
  userId: string;
}

export function GradesTab({ submissions, assignments, userId }: GradesTabProps) {
  const gradedSubmissions = submissions.filter((sub: Submission) => sub.marks > 0);
  const pendingSubmissions = submissions.filter((sub: Submission) => sub.marks === 0);

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  const chartData = gradedSubmissions
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    .map((submission, index) => ({
      x: index + 1,
      y: Math.round((submission.marks / submission.assignment.maxMarks) * 100),
      name: submission.assignment.title.length > 20 
        ? submission.assignment.title.substring(0, 20) + '...'
        : submission.assignment.title,
      fullTitle: submission.assignment.title,
      date: new Date(submission.submittedAt).toLocaleDateString(),
      color: colors[index % colors.length]
    }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Scores</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          {gradedSubmissions.length > 0 ? (
            <div className="flex flex-col h-full">
              <ResponsiveContainer width="100%" height="80%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    domain={[0, Math.max(assignments.length, 10)]}
                  />
                  <YAxis type="number" dataKey="y" domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 rounded-lg shadow border">
                            <p className="font-medium">{data.fullTitle}</p>
                            <p className="text-sm text-muted-foreground">Score: {data.y}%</p>
                            <p className="text-sm text-muted-foreground">Date: {data.date}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {chartData.map((data, index) => (
                    <Scatter
                      key={index}
                      data={[data]}
                      fill={data.color}
                    >
                      <circle r={12} fill={data.color} />
                    </Scatter>
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {chartData.map((entry, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: entry.color + '20', color: entry.color }}
                  >
                    {entry.name}: {entry.y}%
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No graded assignments yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rest of the cards remain the same ... */}
    </div>
  );
} 