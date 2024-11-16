import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { FileText, ExternalLink, BarChart, Loader2, Trash2, Edit, Plus, CheckSquare, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, set } from "date-fns";
import { Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import ConfirmationModal from '@/components/classroom/ConfirmationModal';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Badge } from "@/components/ui/badge";
import { Submission } from '@prisma/client';

interface Assignment {
  id: number;
  title: string;
  deadline: string;
  description?: string;
  maxMarks?: number;
  requirements?: string[];
  creator: {
    firstName: string;
  };
  submission?: {
    status: 'submitted' | 'graded' | 'not_submitted';
    marks?: number;
    submittedAt?: string;
  };
}

interface AssignmentsTabProps {
  assignments: Assignment[];
  classroomId: string;
  userRole: 'STUDENT' | 'PROFESSOR' | 'ADMIN' | undefined; // Update this line
  onCreateAssignment: (assignment: any) => Promise<Assignment | null>;
  onDeleteAssignment: (assignmentId: number) => Promise<boolean>;
  onUpdateAssignment: (assignmentId: number, updatedData: Partial<Assignment>) => Promise<boolean>;
  isCreatingAssignment: boolean;
  isLoading: boolean;
  submissions: {
    id: string;
    submittedAt: Date | string;
    content: string;
    userId: string;
    assignmentId: string;
    marks: number;
  }[];
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
  
  if (days === 0) {
    return `Due ${due.getHours() === 23 ? 'tonight' : 'today'} at ${format(due, 'h:mm a')}`
  } else if (days === 1) {
    return `Due tomorrow at ${format(due, 'h:mm a')}`
  } else {
    return `Due in ${days} days at ${format(due, 'h:mm a')}`
  }
}

const getDefaultDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7); // Default to 7 days
  date.setHours(23, 59, 0, 0); // Default to midnight
  return date;
};

const setDeadlineDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const setDeadlineTime = (isMidnight: boolean) => {
  return isMidnight ? 23 : 11;
};

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({
  assignments,
  classroomId,
  userRole,
  onCreateAssignment,
  onDeleteAssignment,
  onUpdateAssignment,
  isCreatingAssignment,
  isLoading,
  submissions
}) => {
  console.log('Current userRole:', userRole);
  console.log('Type of userRole:', typeof userRole);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [assignmentToUpdate, setAssignmentToUpdate] = useState<Assignment | null>(null);

  // Update local assignments when props change
  useEffect(() => {
    setLocalAssignments(assignments);
  }, [assignments]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdAssignment = await onCreateAssignment(newAssignment);
      if (createdAssignment) {
        setIsDialogOpen(false);
        setNewAssignment({ title: '', description: '', maxMarks: 25, requirements: [], deadline: getDefaultDeadline() });
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
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
        model: 'gemini-1.5-pro',
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

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentToUpdate || !onUpdateAssignment) return;

    try {
      setIsSubmitting(true);
      const success = await onUpdateAssignment(assignmentToUpdate.id, assignmentToUpdate);
      if (success) {
        setIsUpdateDialogOpen(false);
        setAssignmentToUpdate(null);
        toast({
          title: "Success",
          description: "Assignment updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separate assignments into active and overdue
  const now = new Date();
  const { activeAssignments, overdueAssignments } = localAssignments.reduce(
    (acc, assignment) => {
      const deadline = new Date(assignment.deadline);
      if (deadline < now) {
        acc.overdueAssignments.push(assignment);
      } else {
        acc.activeAssignments.push(assignment);
      }
      return acc;
    },
    { activeAssignments: [] as Assignment[], overdueAssignments: [] as Assignment[] }
  );

  // Sort active assignments by earliest deadline first
  const sortedActiveAssignments = activeAssignments.sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  // Sort overdue assignments by most recently due first
  const sortedOverdueAssignments = overdueAssignments.sort((a, b) =>
    new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardContent className="flex items-center justify-between p-4">
              <div className="space-y-2 flex-1">
                <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Assignments Grid */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Active Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Assignment Card - Only for Professors and Admins */}
          {(userRole === 'PROFESSOR' || userRole === 'ADMIN') && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Card className="relative group hover:shadow-lg transition-all duration-300 border-dashed border-2">
                  <CardContent className="flex flex-col items-center justify-center h-[300px] cursor-pointer hover:bg-accent/50 transition-colors">
                    <Plus className="h-12 w-12 mb-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <h3 className="text-lg font-semibold text-muted-foreground group-hover:text-primary">Create New Assignment</h3>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Add a new assignment for your students
                    </p>
                  </CardContent>
                </Card>
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
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm mb-2">Select Duration</Label>
                                <div className="flex flex-wrap gap-2">
                                  {[1, 2, 7, 14].map((days) => (
                                    <Button
                                      key={days}
                                      type="button"
                                      variant={newAssignment.deadline.getDate() === setDeadlineDays(days).getDate() ? "default" : "outline"}
                                      onClick={() => {
                                        const newDate = setDeadlineDays(days);
                                        newDate.setHours(newAssignment.deadline.getHours());
                                        newDate.setMinutes(59);
                                        setNewAssignment(prev => ({ ...prev, deadline: newDate }));
                                      }}
                                    >
                                      {days} {days === 1 ? 'Day' : 'Days'}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm mb-2">Select Time</Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant={newAssignment.deadline.getHours() === 23 ? "default" : "outline"}
                                    onClick={() => {
                                      const newDate = new Date(newAssignment.deadline);
                                      newDate.setHours(23, 59, 0, 0);
                                      setNewAssignment(prev => ({ ...prev, deadline: newDate }));
                                    }}
                                  >
                                    Midnight (11:59 PM)
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={newAssignment.deadline.getHours() === 11 ? "default" : "outline"}
                                    onClick={() => {
                                      const newDate = new Date(newAssignment.deadline);
                                      newDate.setHours(11, 59, 0, 0);
                                      setNewAssignment(prev => ({ ...prev, deadline: newDate }));
                                    }}
                                  >
                                    Afternoon (11:59 AM)
                                  </Button>
                                </div>
                              </div>
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
                            Loading...
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
                        <Button 
                          type="submit" 
                          disabled={isCreatingAssignment}
                        >
                          {isCreatingAssignment ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create Assignment'
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Empty State for Students */}
          {sortedActiveAssignments.length === 0 && userRole === 'STUDENT' && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No Active Assignments</h3>
              <p className="text-sm text-muted-foreground mt-2">
                There are no active assignments at the moment. Check back later!
              </p>
            </div>
          )}

          {/* Empty State for Professors */}
          {sortedActiveAssignments.length === 0 && (userRole === 'PROFESSOR' || userRole === 'ADMIN') && (
            <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
              <p className="text-sm text-muted-foreground mt-2">
                Create your first assignment to get started!
              </p>
            </div>
          )}

          {/* Active Assignment Cards */}
          {sortedActiveAssignments.map((assignment) => (
            <Card key={assignment.id} className="relative group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 h-[300px] flex flex-col">
                {/* Status Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {/* Deadline Badge */}
                  <Badge variant={new Date(assignment.deadline) < new Date() ? "destructive" : "secondary"}>
                    {new Date(assignment.deadline) < new Date() ? 'Overdue' : 'Due'} {format(new Date(assignment.deadline), 'MMM d')}
                  </Badge>
                  
                  {/* Submission Status */}
                  {submissions?.some(sub => sub.assignmentId === assignment.id.toString()) && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100/80">
                      Submitted
                    </Badge>
                  )}
                </div>

                {/* Title and Description */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{assignment.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {assignment.description || "No description provided"}
                  </p>
                  
                  {/* Assignment Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {format(new Date(assignment.deadline), 'PPP')}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {format(new Date(assignment.deadline), 'p')}
                    </div>
                    {assignment.maxMarks && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BarChart className="h-4 w-4 mr-2" />
                        {assignment.maxMarks} points
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Link href={`/classroom/${classroomId}/assignment/${assignment.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>

                  {/* Show Evaluate button only for professors */}
                  {(userRole === 'PROFESSOR' || userRole === 'ADMIN') && (
                    <Link href={`/classroom/${classroomId}/assignment/${assignment.id}/evaluate`}>
                      <Button variant="outline" size="icon" className="text-blue-500 hover:text-blue-700">
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}

                  {(userRole === 'PROFESSOR' || userRole === 'ADMIN') && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setAssignmentToUpdate(assignment);
                          setIsUpdateDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteClick(assignment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Overdue Assignments List */}
      {(sortedOverdueAssignments.length > 0 || userRole === 'STUDENT') && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Past Assignments</h2>
          {sortedOverdueAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/40">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No Past Assignments</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You don't have any past assignments yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedOverdueAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{assignment.title}</h3>
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                      {submissions?.some(sub => sub.assignmentId === assignment.id.toString()) && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          Submitted
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {format(new Date(assignment.deadline), 'PPP')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(assignment.deadline), 'p')}
                      </div>
                      {assignment.maxMarks && (
                        <div className="flex items-center">
                          <BarChart className="h-4 w-4 mr-1" />
                          {assignment.maxMarks} points
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/classroom/${classroomId}/assignment/${assignment.id}`}>
                      <Button variant="secondary" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>

                    {(userRole === 'PROFESSOR' || userRole === 'ADMIN') && (
                      <>
                        <Link href={`/classroom/${classroomId}/assignment/${assignment.id}/evaluate`}>
                          <Button variant="outline" size="icon" className="text-blue-500 hover:text-blue-700">
                            <CheckSquare className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setAssignmentToUpdate(assignment);
                            setIsUpdateDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteClick(assignment)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone and will also delete all submissions for this assignment."
      />
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Assignment</DialogTitle>
          </DialogHeader>
          {assignmentToUpdate && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="update-title" className="text-right">Title</Label>
                  <Input
                    id="update-title"
                    value={assignmentToUpdate.title}
                    onChange={(e) => setAssignmentToUpdate({
                      ...assignmentToUpdate,
                      title: e.target.value
                    })}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="update-description" className="text-right">Description</Label>
                  <textarea
                    id="update-description"
                    value={assignmentToUpdate.description || ''}
                    onChange={(e) => setAssignmentToUpdate({
                      ...assignmentToUpdate,
                      description: e.target.value
                    })}
                    className="col-span-3 min-h-[100px] p-2 rounded-md border"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="update-maxMarks" className="text-right">Max Marks</Label>
                  <Input
                    id="update-maxMarks"
                    type="number"
                    value={assignmentToUpdate.maxMarks || 25}
                    onChange={(e) => setAssignmentToUpdate({
                      ...assignmentToUpdate,
                      maxMarks: parseInt(e.target.value)
                    })}
                    className="col-span-3"
                    min={0}
                  />
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Requirements</Label>
                  <div className="col-span-3 space-y-2">
                    {(assignmentToUpdate.requirements || []).map((req, index) => (
                      <textarea
                        key={index}
                        value={req}
                        onChange={(e) => {
                          const newReqs = [...(assignmentToUpdate.requirements || [])];
                          newReqs[index] = e.target.value;
                          setAssignmentToUpdate({
                            ...assignmentToUpdate,
                            requirements: newReqs
                          });
                        }}
                        className="w-full min-h-[60px] p-2 rounded-md border"
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Deadline</Label>
                  <div className="col-span-3 space-y-4">
                    <div>
                      <Label className="text-sm mb-2">Duration</Label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 7, 14].map((days) => (
                          <Button
                            key={days}
                            type="button"
                            variant={new Date(assignmentToUpdate.deadline).getDate() === setDeadlineDays(days).getDate() ? "default" : "outline"}
                            onClick={() => {
                              const newDate = setDeadlineDays(days);
                              newDate.setHours(new Date(assignmentToUpdate.deadline).getHours());
                              newDate.setMinutes(59);
                              setAssignmentToUpdate({
                                ...assignmentToUpdate,
                                deadline: newDate.toISOString()
                              });
                            }}
                          >
                            {days} {days === 1 ? 'Day' : 'Days'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm mb-2">Time</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={new Date(assignmentToUpdate.deadline).getHours() === 23 ? "default" : "outline"}
                          onClick={() => {
                            const newDate = new Date(assignmentToUpdate.deadline);
                            newDate.setHours(23, 59);
                            setAssignmentToUpdate({
                              ...assignmentToUpdate,
                              deadline: newDate.toISOString()
                            });
                          }}
                        >
                          Midnight (11:59 PM)
                        </Button>
                        <Button
                          type="button"
                          variant={new Date(assignmentToUpdate.deadline).getHours() === 11 ? "default" : "outline"}
                          onClick={() => {
                            const newDate = new Date(assignmentToUpdate.deadline);
                            newDate.setHours(11, 59);
                            setAssignmentToUpdate({
                              ...assignmentToUpdate,
                              deadline: newDate.toISOString()
                            });
                          }}
                        >
                          Afternoon (11:59 AM)
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUpdateDialogOpen(false);
                    setAssignmentToUpdate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Assignment'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
