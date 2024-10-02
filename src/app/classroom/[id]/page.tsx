'use client'

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Link from "next/link"
import { CheckCircle, XCircle, Book, ExternalLink, Bell, BarChart, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Classroom {
  id: number;
  name: string;
  code: string;
  inviteLink: string;
  year: string;
  division: string;
  adminFirstName: string;
  description: string;
  startDate: string;
  endDate: string;
  courseCode: string;
}

interface User {
  id: string;
  firstName: string;
  email: string;
  role: string;
}

interface Assignment {
  id: number;
  title: string;
  type: 'theory' | 'lab';
  deadline: string;
  creator: {
    firstName: string;
  };
}

function getRemainingTime(dueDate: string) {
  const now = new Date()
  const due = new Date(dueDate)
  const diff = due.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return `${days}d ${hours}h remaining`
}

function getProgress(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = new Date().getTime()
  return Math.round(((now - start) / (end - start)) * 100)
}

const ClassroomPage = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const params = useParams();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', type: 'theory' as 'theory' | 'lab', deadline: new Date() });
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);

  const fetchClassroomData = useCallback(async () => {
    if (!params.id) return;

    try {
      const response = await axios.get(`/api/classrooms/${params.id}`);
      setClassroom(response.data.classroom);
      setMembers(response.data.members || []);
    } catch (err) {
      console.error('Failed to fetch classroom data:', err);
      setError('Failed to load classroom data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  const fetchAssignments = useCallback(async () => {
    if (!params.id) return;
    try {
      const response = await axios.get(`/api/classrooms/${params.id}/assignments`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      setError('Failed to load assignments. Please try again later.');
    }
  }, [params.id]);

  useEffect(() => {
    if (isUserLoaded && user && params.id) {
      fetchClassroomData();
      fetchAssignments();
    }
  }, [isUserLoaded, user, params.id, fetchClassroomData, fetchAssignments]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedDeadline = newAssignment.deadline.toISOString();
      const response = await axios.post(`/api/classrooms/${params.id}/assignments`, {
        ...newAssignment,
        deadline: formattedDeadline,
      });
      const createdAssignment = response.data;
      setAssignments([...assignments, createdAssignment]);
      setIsDialogOpen(false);
      setNewAssignment({ title: '', type: 'theory', deadline: new Date() });
    } catch (error) {
      console.error('Failed to create assignment:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create assignment. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const progress = classroom ? getProgress(classroom.startDate, classroom.endDate) : 0;

  if (!isUserLoaded || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  if (!user) return <p className="text-center text-xl mt-10">You need to be logged in</p>;

  if (error) return <p className="text-center text-xl mt-10 text-red-500">{error}</p>;

  if (!classroom) return <p className="text-center text-xl mt-10">Classroom not found</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="relative mb-16">
        <div className="w-full h-48 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1579547621706-1a9c79d5c9f1?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Classroom header"
            layout="fill"
            objectFit="cover"
          />
        </div>
        
        <div className="container mx-auto px-4">
          <Card className="relative -mt-16 z-10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{classroom.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">{classroom.year}</Badge>
                  <Badge variant="outline">Division {classroom.division}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
              <div>
                  <p className="text-sm font-medium">Course Code</p>
                  <p className="text-2xl font-bold">{classroom.courseCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Classroom Owner</p>
                  <p className="text-2xl font-bold">{classroom.adminFirstName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Classroom Code</p>
                  <p className="text-lg">{classroom.code}</p>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">{classroom.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-4 w-4" />
              Latest Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No announcements at this time.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Assignments Completed</p>
                <Progress value={33} className="mt-2" />
                <p className="mt-1 text-sm text-muted-foreground">1 out of 3 assignments completed</p>
              </div>
              <div>
                <p className="font-medium">Overall Grade</p>
                <Progress value={85} className="mt-2" />
                <p className="mt-1 text-sm text-muted-foreground">Current Grade: 85%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="mb-8">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments">
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
                    {/* Add submission status indicator here */}
                    <Link href={`/classroom/${params.id}/assignment/${assignment.id}`}>
                      <Button variant="outline">
                        View Assignment
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4">Create New Assignment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAssignment}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Assignment Name
                    </Label>
                    <Input
                      id="title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Assignment Type
                    </Label>
                    <Select
                      onValueChange={(value: 'theory' | 'lab') => setNewAssignment({ ...newAssignment, type: value })}
                      defaultValue={newAssignment.type}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="theory">Theory</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deadline" className="text-right">
                      Deadline
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`col-span-3 justify-start text-left font-normal`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newAssignment.deadline ? format(newAssignment.deadline, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newAssignment.deadline}
                          onSelect={(date) => date && setNewAssignment({ ...newAssignment, deadline: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="time" className="text-right">
                      Time
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={format(newAssignment.deadline, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(newAssignment.deadline);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setNewAssignment({ ...newAssignment, deadline: newDate });
                      }}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Create Assignment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        <TabsContent value="resources">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Class Materials</h3>
              <ul className="space-y-2">
                {/* Add resource links here */}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="grades">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Your Grades</h3>
              <div className="space-y-4">
                {/* Add grade information here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Enrolled Students</h2>
        {members.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.firstName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No students enrolled in this course yet.</p>
        )}
      </div>

      <div className="mt-8">
        <Link href={`/classroom/${params.id}/attendance`}>
          <Button>Manage Attendance</Button>
        </Link>
      </div>
    </div>
  );
};

export default ClassroomPage;