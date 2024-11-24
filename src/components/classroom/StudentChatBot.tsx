'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Loader2, Bot, User, AlertCircle, Info, Share2, Download, Copy, Calendar, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { generateWithGemini } from '@/lib/utils/gemini';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from 'react-markdown';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface StudentChatBotProps {
  studentData: any; // Replace 'any' with your Student interface
}

export function StudentChatBot({ studentData }: StudentChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'system',
    content: `# Student Information Assistant

Welcome, Professor! I can help you analyze ${studentData.firstName} ${studentData.lastName}'s academic progress.

You can ask about:
* Attendance patterns and concerns
* Academic performance and trends
* Assignment submissions and deadlines
* Course-specific progress
* Areas needing attention

Try questions like:
* "What are the main concerns for this student?"
* "How is their attendance trend?"
* "Show me their recent submission history"
* "Which courses need immediate attention?"`,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickPrompts] = useState([
    { icon: AlertTriangle, text: "Main concerns?", prompt: "What are the main concerns for this student?" },
    { icon: Calendar, text: "Attendance", prompt: "Show me their attendance pattern" },
    { icon: BookOpen, text: "Assignments", prompt: "Show recent assignment submissions" },
    { icon: CheckCircle2, text: "Progress", prompt: "Summarize overall academic progress" },
  ]);

  const formatResponse = (text: string): string => {
    return text
      .replace(/(\d+\.?\d*)%/g, '**$1%**')
      .replace(/(\d+)\/(\d+)/g, '**$1**/**$2**')
      .replace(/^•/gm, '•')  // Keep bullet points as is
      .replace(/\b(Present|Absent|Late)\b/g, '**$1**')
      .replace(/\b(Alert|Warning|Critical)\b/g, '❗**$1**');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date()
    }]);
    setIsLoading(true);

    try {
      const prompt = `
        You are an academic advisor assistant helping a professor analyze student performance.
        Current student: ${studentData.firstName} ${studentData.lastName} (${studentData.srn})

        Available student information:
        
        ## Academic Profile
        * Year: ${studentData.year}
        * Division: ${studentData.division}
        * SRN: ${studentData.srn}
        * PRN: ${studentData.prn}

        ## Attendance Analysis
        * Overall: ${studentData.attendance.overall.percentage.toFixed(1)}% (${studentData.attendance.overall.present}/${studentData.attendance.overall.total})
        * Course-wise Attendance:
        ${studentData.attendance.byClassroom.map((course: { courseName: any; percentage: number; present: any; total: any; }) => 
          `  - ${course.courseName}: ${course.percentage.toFixed(1)}% (${course.present}/${course.total})`
        ).join('\n')}
        
        ## Recent Attendance Records
        ${studentData.attendance.records.data
          .sort((a: { date: string | number | Date; }, b: { date: string | number | Date; }) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map((record: { date: string | number | Date; classroom: { name: any; }; isPresent: any; }) => 
            `* ${new Date(record.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })} - ${record.classroom.name}: ${record.isPresent ? 'Present' : 'Absent'}`
          ).join('\n')}

        ## Academic Performance
        * Overall Score: ${studentData.performance.submissions.percentage.toFixed(1)}%
        * Submissions On Time: ${studentData.performance.submissions.onTime}/${studentData.performance.submissions.total}
        * Recent Submissions:
        ${studentData.submissions
          .sort((a: { submittedAt: string | number | Date; }, b: { submittedAt: string | number | Date; }) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
          .slice(0, 5)
          .map((sub: { assignment: { title: any; classroom: { name: any; }; maxMarks: number; deadline: string | number | Date; }; marks: number; submittedAt: string | number | Date; }) => 
            `  - ${sub.assignment.title} (${sub.assignment.classroom.name})
               Score: ${sub.marks}/${sub.assignment.maxMarks} (${((sub.marks/sub.assignment.maxMarks)*100).toFixed(1)}%)
               ${new Date(sub.submittedAt) > new Date(sub.assignment.deadline) ? '⚠️ Late Submission' : '✅ On Time'}`
          ).join('\n')}

        ## Areas of Concern
        ${studentData.attendance.byClassroom
          .filter((course: { percentage: number; }) => course.percentage < 75)
          .map((course: { courseName: any; percentage: number; total: number; present: number; }) => 
            `* ${course.courseName}: Attendance at ${course.percentage.toFixed(1)}% (Requires ${
              Math.ceil((75 * course.total - 100 * course.present) / 25)
            } more classes for 75%)`
          ).join('\n')}
        ${studentData.submissions
          .filter((sub: { marks: number; assignment: { maxMarks: number; }; }) => (sub.marks / sub.assignment.maxMarks) < 0.6)
          .map((sub: { assignment: { title: any; maxMarks: number; }; marks: number; }) => 
            `* Low score in ${sub.assignment.title}: ${((sub.marks/sub.assignment.maxMarks)*100).toFixed(1)}%`
          ).join('\n')}

        Previous Conversation:
        ${messages.filter(m => m.role !== 'system').map(m => 
          `${m.role.toUpperCase()}: ${m.content}`
        ).join('\n')}

        Guidelines for responses:
        1. Focus on academic insights and patterns
        2. Highlight concerning trends that need attention
        3. Provide specific recommendations when relevant
        4. Use data to support observations
        5. Format responses with clear sections and bullet points
        6. Include specific dates and numbers where relevant
        7. Suggest intervention strategies when performance is below expectations
        8. Compare performance across different courses when relevant

        Current Question: ${userMessage}

        Provide a professional, analytical response focusing on insights that would be valuable to a professor.
      `;

      const response = await generateWithGemini(prompt);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportChat = () => {
    const chatContent = messages
      .map(m => `${m.role.toUpperCase()} (${m.timestamp.toLocaleString()}): ${m.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${studentData.firstName}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const copyToClipboard = async () => {
    const chatContent = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    await navigator.clipboard.writeText(chatContent);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {isOpen ? (
        <Card className="w-[800px] h-[800px] flex flex-col shadow-xl rounded-2xl border-2">
          <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Student Assistant</h3>
                <p className="text-sm text-primary-foreground/70">Analyzing {studentData.firstName}&apos;s progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={copyToClipboard}
                      className="hover:bg-white/10 text-primary-foreground h-10 w-10"
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy chat</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={exportChat}
                      className="hover:bg-white/10 text-primary-foreground h-10 w-10"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Export chat</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 text-primary-foreground h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-4 border-b bg-muted/30">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="flex items-center gap-2 whitespace-nowrap text-sm py-5"
                  onClick={() => {
                    setInput(prompt.prompt);
                    handleSend();
                  }}
                >
                  <prompt.icon className="h-5 w-5" />
                  <span>{prompt.text}</span>
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role !== 'user' && (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      {message.role === 'system' ? (
                        <Info className="h-5 w-5 text-primary" />
                      ) : (
                        <Bot className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-6 py-4 max-w-[70%] ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-12'
                        : message.role === 'system'
                        ? 'bg-muted/50 border'
                        : 'bg-accent/50 border'
                    }`}
                  >
                    <div className="prose prose-base dark:prose-invert max-w-none">
                      <ReactMarkdown>
                        {message.role === 'assistant' ? formatResponse(message.content) : message.content}
                      </ReactMarkdown>
                    </div>
                    <div className="text-xs mt-2 opacity-60">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-2xl px-4 py-2.5 bg-accent/50 border">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-muted/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex flex-col gap-3"
            >
              <div className="flex gap-3 mb-2">
                <Badge className="px-4 py-1.5 text-sm" variant={studentData.attendance.overall.percentage >= 75 ? "default" : "secondary"}>
                  Attendance: {studentData.attendance.overall.percentage.toFixed(1)}%
                </Badge>
                <Badge className="px-4 py-1.5 text-sm" variant={studentData.performance.submissions.percentage >= 60 ? "default" : "secondary"}>
                  Performance: {studentData.performance.submissions.percentage.toFixed(1)}%
                </Badge>
              </div>

              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about attendance, performance, etc..."
                  className="flex-1 rounded-xl border-2 py-6 text-base"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading}
                  className="rounded-xl bg-primary hover:bg-primary/90 h-12 w-12"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-16 w-16 shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
          size="icon"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      )}
    </div>
  );
}