import React, { useState } from 'react';
import Link from "next/link";
import { FileText, ExternalLink, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  type: 'theory' | 'lab';
  deadline: string;
  creator: {
    firstName: string;
  };
}

interface AssignmentsTabProps {
  assignments: Assignment[];
  classroomId: string;
  userRole: string;
  onCreateAssignment: (assignment: any) => Promise<void>;
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

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ assignments, classroomId, userRole, onCreateAssignment }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', type: 'theory' as 'theory' | 'lab', deadline: new Date() });

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateAssignment(newAssignment);
    setIsDialogOpen(false);
    setNewAssignment({ title: '', type: 'theory', deadline: new Date() });
  };

  return (
    <>
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              There are no assignments for this class yet. Check back later or ask your instructor for more information.
            </p>
            {userRole === 'professor' && (
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                Create New Assignment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAssignment}>
            {/* Form fields for new assignment */}
            {/* ... (keep the existing form fields) */}
            <div className="flex justify-end">
              <Button type="submit">Create Assignment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
