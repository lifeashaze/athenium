'use client'

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Link from "next/link"
import { CheckCircle, XCircle, Book, ExternalLink, Bell, BarChart, Users, ChevronLeft, ChevronRight, FileText, BarChart2, Loader2 } from "lucide-react"
import { useDropzone } from 'react-dropzone';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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

interface Resource {
  id: number;
  title: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
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

function getProgress(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = new Date().getTime()
  return Math.round(((now - start) / (end - start)) * 100)
}

function getRoleBadgeColor(role: string) {
  const roleColors = {
    student: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    professor: "bg-green-100 text-green-800 hover:bg-green-200",
    admin: "bg-red-100 text-red-800 hover:bg-red-200",
  };
  return roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const ITEMS_PER_PAGE = 10;

const ClassroomPage = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const params = useParams();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', type: 'theory' as 'theory' | 'lab', deadline: new Date() });
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

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

  const fetchResources = useCallback(async () => {
    if (!params.id) return;
    try {
      const response = await axios.get(`/api/classrooms/${params.id}/resources`);
      // Even if the response is an empty array, we'll set it to the state
      setResources(response.data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      setError('Failed to load resources. Please try again later.');
    }
  }, [params.id]);

  useEffect(() => {
    if (isUserLoaded && user && params.id) {
      fetchClassroomData();
      fetchAssignments();
      fetchResources();
    }
  }, [isUserLoaded, user, params.id, fetchClassroomData, fetchAssignments, fetchResources]);

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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    await uploadResource(file);
  }, [params.id]);

  const uploadResource = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`/api/classrooms/${params.id}/resources`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResources(prevResources => [...prevResources, response.data]);
    } catch (error) {
      console.error('Failed to upload resource:', error);
      setError('Failed to upload resource. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const progress = classroom ? getProgress(classroom.startDate, classroom.endDate) : 0;

  const paginatedMembers = members.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);

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
      <Card className="mb-8">
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

      <Tabs defaultValue="assignments" className="mb-8">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  There are no assignments for this class yet. Check back later or ask your instructor for more information.
                </p>
                {(user as any)?.role === 'professor' && (
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
                      {/* Add submission status indicator here */}
                      <Link href={`/classroom/${params.id}/assignment/${assignment.id}`}>
                        <Button variant="outline">
                          View Assignment
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/classroom/${params.id}/assignment/${assignment.id}/evaluate`}>
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
            <CardContent>
              {resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Book className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Resources Available</h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm">
                    There are no resources uploaded for this class yet. Be the first to upload study materials!
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {resources.map((resource) => (
                    <Card key={resource.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="text-lg font-semibold">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground">Uploaded by: {resource.uploadedBy}</p>
                          <p className="text-sm text-muted-foreground">Date: {new Date(resource.uploadedAt).toLocaleString()}</p>
                        </div>
                        <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                          <Button>View Resource</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <div {...getRootProps()} className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer">
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Drop the file here ...</p>
                  ) : (
                    <p>Drag n drop a file here, or click to select a file</p>
                  )}
                </div>
                <div className="mt-2 flex justify-center">
                  <Button
                    onClick={() => document.getElementById('fileInput')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Resource'
                    )}
                  </Button>
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadResource(file);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="grades">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <BarChart2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Grades Available</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                There are no grades to display at this time. Grades will appear here once assignments have been graded.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Enrolled Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {members.length > 0 ? (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Name</TableHead>
                        <TableHead className="font-bold">Email</TableHead>
                        <TableHead className="font-bold">Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMembers.map((member) => (
                        <TableRow key={member.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{member.firstName}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Badge className={`${getRoleBadgeColor(member.role)} transition-colors duration-200`}>
                              {capitalizeFirstLetter(member.role)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, members.length)} of {members.length} members
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No students enrolled in this course yet.</p>
            )}
          </CardContent>
        </Card>
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