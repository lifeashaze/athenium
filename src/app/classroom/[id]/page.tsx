'use client'

import { useEffect, useState, useCallback } from 'react';
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
  const [members, setMembers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const handleCreateAssignment = async (newAssignment: any) => {
    try {
      const formattedDeadline = newAssignment.deadline.toISOString();
      const response = await axios.post(`/api/classrooms/${params.id}/assignments`, {
        ...newAssignment,
        deadline: formattedDeadline,
      });
      const createdAssignment = response.data;
      setAssignments([...assignments, createdAssignment]);
    } catch (error) {
      console.error('Failed to create assignment:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create assignment. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleUploadResource = async (file: File) => {
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

  const progress = classroom ? getProgress(classroom.startDate, classroom.endDate) : 0;

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
          <TabsTrigger value="code-execution">Code Execution</TabsTrigger>
          <TabsTrigger value="enrolled-students">Enrolled Students</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments">
          <AssignmentsTab
            assignments={assignments}
            classroomId={params.id as string}
            userRole={(user as any)?.role}
            onCreateAssignment={handleCreateAssignment}
          />
        </TabsContent>
        <TabsContent value="resources">
          <ResourcesTab
            resources={resources}
            isUploading={isUploading}
            onUpload={handleUploadResource}
          />
        </TabsContent>
        <TabsContent value="grades">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <h3 className="text-lg font-semibold mb-2">No Grades Available</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                There are no grades to display at this time. Grades will appear here once assignments have been graded.
              </p>
            </CardContent>
          </Card>
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
          <Button>Manage Attendance</Button>
        </Link>
      </div>
    </div>
  );
};

export default ClassroomPage;
