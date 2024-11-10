'use client'

import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import CodeExecution from '@/components/CodeExecution';
import { AssignmentsTab } from '@/components/classroom/AssignmentsTab';
import { ResourcesTab } from '@/components/classroom/ResourcesTab';
import { EnrolledStudentsTab } from '@/components/classroom/EnrolledStudentsTab';
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Users, BookOpen, Code } from 'lucide-react';
import { GradesTab } from '@/components/classroom/GradesTab';

interface Classroom {
  id: number;
  name: string;
  code: string;
  inviteLink: string;
  year: string;
  division: string;
  creatorFirstName: string;
  creatorLastName: string;
  creatorEmail: string;
  courseCode: string;
  courseName: string;
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
  maxMarks: number;
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

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  rollNo: string | null;
  srn: string | null;
  prn: string | null;
}

interface Submission {
  id: string;
  marks: number;
  submittedAt: string;
  assignment: {
    id: string;
    title: string;
    maxMarks: number;
  };
}

function getProgress(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = new Date().getTime()
  return Math.round(((now - start) / (end - start)) * 100)
}

const ITEMS_PER_PAGE = 10;

const ClassroomPage = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const params = useParams();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const assignmentsRef = useRef<Assignment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const fetchClassroomData = useCallback(async () => {
    if (!params.id) return;

    try {
      const response = await axios.get(`/api/classrooms/${params.id}`);
      setClassroom(response.data.classroom);

      // Log classroom and creator details
      console.log('Fetched classroom data:', response.data.classroom);
      console.log('Creator details:', response.data.classroom.creator);

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
      assignmentsRef.current = response.data;
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      setError('Failed to load assignments. Please try again later.');
    }
  }, [params.id]);

  const fetchResources = useCallback(async () => {
    if (!params.id) return;
    try {
      const response = await axios.get(`/api/classrooms/${params.id}/resources`);
      setResources(response.data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      setError('Failed to load resources. Please try again later.');
    }
  }, [params.id]);

  const fetchMembers = useCallback(async () => {
    if (!params.id) return;
    try {
      const response = await axios.get(`/api/classrooms/${params.id}/members`);
      console.log('Fetched members:', response.data);
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      setError('Failed to load members. Please try again later.');
    }
  }, [params.id]);

  const fetchSubmissions = useCallback(async () => {
    if (!params.id) return;
    try {
      const response = await axios.get(`/api/classrooms/${params.id}/submissions`);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setError('Failed to load submissions. Please try again later.');
    }
  }, [params.id]);

  useEffect(() => {
    if (isUserLoaded && user && params.id) {
      fetchClassroomData();
      fetchAssignments();
      fetchResources();
      fetchMembers();
      fetchSubmissions();
    }
  }, [isUserLoaded, user, params.id, fetchClassroomData, fetchAssignments, fetchResources, fetchMembers, fetchSubmissions]);

  const handleCreateAssignment = async (newAssignment: any): Promise<Assignment | null> => {
    try {
      const formattedDeadline = newAssignment.deadline.toISOString();
      const response = await axios.post(`/api/classrooms/${params.id}/assignments`, {
        ...newAssignment,
        deadline: formattedDeadline,
      });
      const createdAssignment = response.data;
      const updatedAssignments = [...assignmentsRef.current, createdAssignment];
      setAssignments(updatedAssignments);
      assignmentsRef.current = updatedAssignments;
      return createdAssignment;
    } catch (error) {
      console.error('Failed to create assignment:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create assignment. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      return null;
    }
  };

  const handleUploadResource = async (file: File, parentId?: string) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) {
      formData.append('parentId', parentId);
    }

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

  const handleDeleteAssignment = async (assignmentId: number): Promise<boolean> => {
    try {
      await axios.delete(`/api/classrooms/${params.id}/assignments/${assignmentId}`);
      const updatedAssignments = assignmentsRef.current.filter(a => a.id !== assignmentId);
      setAssignments(updatedAssignments);
      assignmentsRef.current = updatedAssignments;
      return true;
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      setError('Failed to delete assignment. Please try again.');
      return false;
    }
  };

  const handleDeleteResource = async (resourceId: number): Promise<void> => {
    try {
      await axios.delete(`/api/classrooms/${params.id}/resources/${resourceId}`);
      setResources(prevResources => prevResources.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error('Failed to delete resource:', error);
      setError('Failed to delete resource. Please try again.');
    }
  };

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
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="mb-8 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold">{classroom.name}</CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">{classroom.courseCode}</p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <Badge variant="secondary" className="text-xs sm:text-sm py-1">{classroom.year}</Badge>
              <Badge variant="outline" className="text-xs sm:text-sm py-1">Division {classroom.division}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Classroom Owner</p>
                <p className="text-sm sm:text-lg font-semibold">
                  {classroom.creatorFirstName} {classroom.creatorLastName}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">{classroom.creatorEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Classroom Code</p>
                <p className="text-sm sm:text-lg font-semibold">{classroom.code}</p>
              </div>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">{classroom.courseName}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="assignments" className="mb-8">
        <TabsList className="flex flex-wrap justify-center md:justify-around gap-2 mb-8">
          <TabsTrigger value="assignments" className="flex-grow sm:flex-grow-0">Assignments</TabsTrigger>
          <TabsTrigger value="resources" className="flex-grow sm:flex-grow-0">Resources</TabsTrigger>
          <TabsTrigger value="grades" className="flex-grow sm:flex-grow-0">Grades</TabsTrigger>
          <TabsTrigger value="code-execution" className="flex-grow sm:flex-grow-0">Code Execution</TabsTrigger>
          <TabsTrigger value="enrolled-students" className="flex-grow sm:flex-grow-0">Students</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments">
          <AssignmentsTab
            assignments={assignments}
            classroomId={params.id as string}
            userRole={(user as any)?.role}
            onCreateAssignment={handleCreateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
          />
        </TabsContent>
        <TabsContent value="resources">
          <ResourcesTab
            resources={resources as any}
            isUploading={isUploading}
            onUpload={handleUploadResource}
            onDelete={handleDeleteResource}
          />
        </TabsContent>
        <TabsContent value="grades">
          <GradesTab
            submissions={submissions}
            assignments={assignments}
            userId={user?.id}
          />
        </TabsContent>
        <TabsContent value="code-execution">
          <CodeExecution />
        </TabsContent>
        <TabsContent value="enrolled-students">
          <EnrolledStudentsTab
            members={members}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Link href={`/classroom/${params.id}/attendance`}>
          <Button className="w-full md:w-auto">
            <Users className="mr-2 h-4 w-4" /> Manage Attendance
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ClassroomPage;
