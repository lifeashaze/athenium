import React from 'react';
import { Card, CardHeader, CardTitle, CardContent} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

interface Submission {
  id: string;
  submittedAt: Date | string;
  content: string;
  userId: string;
  assignmentId: string;
  marks: number;
  assignment: {
    id: string;
    title: string;
    maxMarks: number;
  };
}

interface Assignment {
  id: number;
  title: string;
  type: 'theory' | 'lab';
  deadline: string;
  maxMarks: number;
  description?: string;
  requirements?: string[];
  creator: {
    firstName: string;
  };
}

interface GradesTabProps {
  submissions: Submission[];
  assignments: Assignment[];
  userId: string;
}

export function GradesTab({ submissions = [], assignments = [], userId }: GradesTabProps) {
  const gradedSubmissions = submissions.filter((sub: Submission) => 
    sub.marks > 0 && sub.assignment
  );

  const chartData = gradedSubmissions
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime())
    .map((submission) => ({
      date: submission.submittedAt.toString(),
      score: submission.assignment 
        ? Math.round((submission.marks / submission.assignment.maxMarks) * 100)
        : 0,
      name: submission.assignment?.title || 'Untitled Assignment'
    }));

  // Calculate statistics
  const averageScore = chartData.length ? Math.round(
    chartData.reduce((acc, curr) => acc + curr.score, 0) / chartData.length
  ) : null;
  const highestScore = chartData.length ? Math.max(...chartData.map(item => item.score)) : null;
  const lowestScore = chartData.length ? Math.min(...chartData.map(item => item.score)) : null;
  const recentTrend = chartData.slice(-3).map(item => item.score);
  const isImproving = recentTrend.length >= 2 && recentTrend[recentTrend.length - 1] > recentTrend[0];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] bg-background">
          {gradedSubmissions.length > 0 ? (
            <ChartContainer config={{ score: { label: "Score (%)", color: "hsl(var(--primary))" }}} className="h-full w-full">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  label={{ value: "Assignment Date", position: "bottom", offset: 20 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={[0, 100]}
                  label={{ value: "Score (%)", angle: -90, position: "insideLeft", offset: 10 }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold">{payload[0].payload.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(payload[0].payload.date)}
                          </p>
                          <p className="font-bold text-primary">
                            Score: {payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No graded assignments yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Assignments List */}
      <Card className="mb-6 bg-card">
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent className="bg-background">
          {chartData.length > 0 ? (
            <div className="space-y-2">
              {chartData.slice(-5).reverse().map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium">{assignment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(assignment.date)}
                    </p>
                  </div>
                  <Badge variant={assignment.score >= 70 ? "default" : "secondary"}>
                    {assignment.score}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No graded assignments available</p>
          )}
        </CardContent>
      </Card>

      {/* Academic Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="bg-background">
            {chartData.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{averageScore ?? 0}%</span>
                    <Badge variant={averageScore ? (averageScore >= 70 ? "blue" : "amber") : "amber"}>
                      {averageScore ? (averageScore >= 70 ? "Good Standing" : "Needs Attention") : "No Data"}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Highest Score</p>
                    <p className="text-xl font-semibold">{highestScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lowest Score</p>
                    <p className="text-xl font-semibold">{lowestScore}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No graded assignments available</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Progress Analysis</CardTitle>
          </CardHeader>
          <CardContent className="bg-background">
            {chartData.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Trend</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {recentTrend.length >= 2 ? (
                        isImproving ? "Improving ↗" : "Declining ↘"
                      ) : (
                        "Not enough data"
                      )}
                    </span>
                    {recentTrend.length >= 2 && (
                      <Badge variant={isImproving ? "blue" : "amber"}>
                        {isImproving ? "Keep it up!" : "Room to grow"}
                      </Badge>
                    )}
                  </div>
                </div>
                {recentTrend.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Last {recentTrend.length} Assignment{recentTrend.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {recentTrend.map((score, index) => (
                        <Badge key={index} variant="outline" className="text-lg">
                          {score}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No graded assignments available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 