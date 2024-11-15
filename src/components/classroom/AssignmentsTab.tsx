import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { FileText, ExternalLink, BarChart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, set } from "date-fns";
import { CalendarIcon, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import ConfirmationModal from '@/components/classroom/ConfirmationModal';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

interface Assignment {
  id: number;
  title: string;
  deadline: string;
  creator: {
    firstName: string;
  };
}

interface AssignmentsTabProps {
  assignments: Assignment[];
  classroomId: string;
  userRole: string;
  onCreateAssignment: (assignment: any) => Promise<Assignment | null>;
  onDeleteAssignment: (assignmentId: number) => Promise<boolean>;
}

function getRemainingTime(dueDate: string) {
  const now = new Date()
  const due = new Date(dueDate)
  const diff = due.getTime() - now.getTime()

  if (diff <= 0) {
    return 'Submission closed'
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return `${days}d ${hours}h remaining`
}

const getDefaultDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7); // Add 7 days
  date.setHours(23, 59, 0, 0); // Set to 11:59 PM
  return date;
};

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({
  assignments,
  classroomId,
  userRole,
  onCreateAssignment,
  onDeleteAssignment,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    maxMarks: 25,
    requirements: [] as string[],
    deadline: getDefaultDeadline()
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const { toast } = useToast();
  const [localAssignments, setLocalAssignments] = useState(assignments);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update local assignments when props change
  useEffect(() => {
    setLocalAssignments(assignments);
  }, [assignments]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdAssignment = await onCreateAssignment(newAssignment);
    if (createdAssignment) {
      setLocalAssignments(prev => [...prev, createdAssignment]);
    }
    setIsDialogOpen(false);
    setNewAssignment({ title: '', description: '', maxMarks: 25, requirements: [], deadline: getDefaultDeadline() });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setNewAssignment(prev => ({
        ...prev,
        deadline: set(prev.deadline, {
          year: date.getFullYear(),
          month: date.getMonth(),
          date: date.getDate()
        })
      }));
    }
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    setNewAssignment(prev => ({
      ...prev,
      deadline: set(prev.deadline, { hours, minutes })
    }));
  };
  const handleDeleteClick = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assignmentToDelete) return;

    try {
      const success = await onDeleteAssignment(assignmentToDelete.id);
      if (success) {
        setLocalAssignments(prevAssignments =>
          prevAssignments.filter(a => a.id !== assignmentToDelete.id)
        );
        toast({
          title: "Assignment deleted",
          description: "The assignment and all its submissions have been deleted.",
        });
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      toast({
        title: "Error",
        description: "Failed to delete the assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
    }
  };

  const generateRequirements = async () => {
    if (!newAssignment.title || !newAssignment.description) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and description before generating requirements.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ].filter(setting => Object.values(HarmCategory).includes(setting.category)),
      });

      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 8192,
        },
      });

      const prompt = `You are an experienced professor creating requirements for an assignment.

Assignment Title: "${newAssignment.title}"
Assignment Description: "${newAssignment.description}"

Generate 3 specific, measurable requirements for this assignment. Each requirement should:
1. Be clear and actionable
2. Include specific criteria for evaluation
3. Be relevant to the assignment topic
4. Focus on technical/academic aspects
5. Each requirement should be a single sentence, within 20 words.
6. Do not use markdown formatting.

Format each requirement as a bullet point starting with "- ".
Keep the requirements concise but detailed enough for proper evaluation.`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      // Convert the bullet points to array
      const requirements = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => line.substring(2));

      setNewAssignment(prev => ({
        ...prev,
        requirements: requirements,
      }));
      setCurrentStep(2);

      toast({
        title: "Requirements Generated",
        description: "AI has generated requirements based on your assignment details.",
      });
    } catch (error) {
      console.error('Error generating requirements:', error);
      toast({
        title: "Error",
        description: "Failed to generate requirements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {localAssignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              There are no assignments for this class yet. Check back later or ask your instructor for more information.
            </p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              Create New Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {localAssignments.map((assignment) => (
            <Card key={assignment.id} className="mb-4">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="text-lg font-semibold">{assignment.title}</h3>
                  <p className="text-sm text-muted-foreground">Due: {new Date(assignment.deadline).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{getRemainingTime(assignment.deadline)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href={`/classroom/${classroomId}/assignment/${assignment.id}`}>
                    <Button variant="outline">
                      View Assignment
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/classroom/${classroomId}/assignment/${assignment.id}/evaluate`}>
                    <Button variant="secondary">
                      Evaluate
                      <BarChart className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(assignment)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mt-4">Create New Assignment</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Assignment - Step {currentStep} of 2</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="grid gap-4 py-4">
              {currentStep === 1 ? (
                // Step 1: Basic Details
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input
                      id="title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <textarea
                      id="description"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      className="col-span-3 min-h-[100px] p-2 rounded-md border"
                      placeholder="Explain what students need to do..."
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="maxMarks" className="text-right">Max Marks</Label>
                    <Input
                      id="maxMarks"
                      type="number"
                      value={newAssignment.maxMarks}
                      onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: parseInt(e.target.value) })}
                      className="col-span-3"
                      min={0}
                    />
                  </div>
                </>
              ) : (
                // Step 2: Requirements and Deadline
                <>
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold">Generated Requirements</Label>
                      <div className="space-y-3">
                        {newAssignment.requirements.map((req, index) => (
                          <div key={index} className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Requirement {index + 1}
                            </Label>
                            <textarea
                              value={req}
                              onChange={(e) => {
                                const newReqs = [...newAssignment.requirements];
                                newReqs[index] = e.target.value;
                                setNewAssignment(prev => ({ ...prev, requirements: newReqs }));
                              }}
                              className="w-full min-h-[80px] p-3 rounded-md border resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-lg font-semibold">Submission Deadline</Label>
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal w-full sm:w-[240px]",
                                !newAssignment.deadline && "text-muted-foreground"
                              )}
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {format(newAssignment.deadline, "PPP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 z-[1000]"
                            align="start"
                          >
                            <CalendarComponent
                              mode="single"
                              selected={newAssignment.deadline}
                              onSelect={(date) => {
                                if (date) {
                                  const newDate = new Date(date);
                                  newDate.setHours(newAssignment.deadline.getHours());
                                  newDate.setMinutes(newAssignment.deadline.getMinutes());
                                  setNewAssignment(prev => ({
                                    ...prev,
                                    deadline: newDate
                                  }));
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal w-full sm:w-[140px]",
                                !newAssignment.deadline && "text-muted-foreground"
                              )}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {format(newAssignment.deadline, "HH:mm")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4">
                            <div className="flex gap-2">
                              <Select
                                value={newAssignment.deadline.getHours().toString()}
                                onValueChange={(value) => handleTimeChange(parseInt(value), newAssignment.deadline.getMinutes())}
                              >
                                <SelectTrigger className="w-[70px]">
                                  <SelectValue placeholder="HH" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                      {i.toString().padStart(2, '0')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={newAssignment.deadline.getMinutes().toString()}
                                onValueChange={(value) => handleTimeChange(newAssignment.deadline.getHours(), parseInt(value))}
                              >
                                <SelectTrigger className="w-[70px]">
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 60 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                      {i.toString().padStart(2, '0')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              {currentStep === 1 ? (
                <Button 
                  type="button" 
                  onClick={async () => {
                    setIsGenerating(true);
                    await generateRequirements();
                    setIsGenerating(false);
                  }}
                  disabled={!newAssignment.title || !newAssignment.description || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Next"
                  )}
                </Button>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit">
                    Create Assignment
                  </Button>
                </>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone and will also delete all submissions for this assignment."
      />
    </>
  );
};
