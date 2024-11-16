'use client'

import { useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import CodeExecution from '@/components/CodeExecution';
import { AssignmentsTab } from '@/components/classroom/AssignmentsTab';
import { EnrolledStudentsTab } from '@/components/classroom/EnrolledStudentsTab';
import { Users, BookOpen } from 'lucide-react';
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
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
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


const ITEMS_PER_PAGE = 10;

const ClassroomPage = () => {
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const params = useParams();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const assignmentsRef = useRef<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  const fetchClassroomData = useCallback(async () => {
    if (!params.id) return;

    try {
      const response = await axios.get(`/api/classrooms/${params.id}`);
      setClassroom(response.data.classroom);

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
      setIsLoadingAssignments(true);
      const response = await axios.get(`/api/classrooms/${params.id}/assignments`, {
        params: {
          includeSubmissions: true
        }
      });
      setAssignments(response.data);
      assignmentsRef.current = response.data;
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      setError('Failed to load assignments. Please try again later.');
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [params.id]);


  const fetchMembers = useCallback(async () => {
    if (!params.id) return;
    try {
      const response = await axios.get(`/api/classrooms/${params.id}/members`);
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

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get('/api/user');
      console.log('User data from DB:', response.data);
      setDbUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }, []);

  useEffect(() => {
    if (isUserLoaded && clerkUser) {
      fetchUserData();
    }
  }, [isUserLoaded, clerkUser, fetchUserData]);

  useEffect(() => {
    if (isUserLoaded && clerkUser && params.id) {
      fetchClassroomData();
      fetchAssignments();
      fetchMembers();
      fetchSubmissions();
    }
  }, [isUserLoaded, clerkUser, params.id, fetchClassroomData, fetchAssignments, fetchMembers, fetchSubmissions]);

  const handleCreateAssignment = async (newAssignment: any): Promise<Assignment | null> => {
    try {
      setIsCreatingAssignment(true);
      
      const formattedDeadline = newAssignment.deadline.toISOString();
      const response = await axios.post(`/api/classrooms/${params.id}/assignments`, {
        ...newAssignment,
        deadline: formattedDeadline,
      });
      const createdAssignment = response.data;
      
      const updatedAssignments = [...assignmentsRef.current, createdAssignment];
      setAssignments(updatedAssignments);
      assignmentsRef.current = updatedAssignments;

      await axios.post(`/api/classrooms/${params.id}/notify`, {
        assignmentTitle: newAssignment.title,
        assignmentDeadline: formattedDeadline,
        description: newAssignment.description,
      });

      return createdAssignment;
    } catch (error) {
      console.error('Failed to create assignment:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create assignment. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      return null;
    } finally {
      setIsCreatingAssignment(false);
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

  const handleUpdateAssignment = async (assignmentId: number, updatedData: Partial<Assignment>): Promise<boolean> => {
    try {
      const formattedData = {
        ...updatedData,
        deadline: updatedData.deadline 
          ? (typeof updatedData.deadline === 'string' 
              ? updatedData.deadline 
              : new Date(updatedData.deadline).toISOString())
          : new Date().toISOString()
      };

      await axios.put(`/api/classrooms/${params.id}/assignments/${assignmentId}`, formattedData);
      
      const updatedAssignments = assignmentsRef.current.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, ...updatedData, deadline: formattedData.deadline }
          : assignment
      );
      
      setAssignments(updatedAssignments);
      assignmentsRef.current = updatedAssignments;
      
      return true;
    } catch (error) {
      console.error('Failed to update assignment:', error);
      setError('Failed to update assignment. Please try again.');
      return false;
    }
  };

  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);

  if (!isUserLoaded || isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Skeleton className="h-[200px] w-full mb-8 rounded-lg" />
        <div className="space-y-2 mb-8">
          <Skeleton className="h-10 w-[200px]" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Skeleton className="h-[100px] rounded-lg" />
            <Skeleton className="h-[100px] rounded-lg" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!clerkUser) return <p className="text-center text-xl mt-10">You need to be logged in</p>;

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
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
            <Link href={`/classroom/${params.id}/resources`} className="w-full sm:w-auto">
              <Button className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                {dbUser?.role === 'PROFESSOR' ? 'Manage Resources' : 'Resources'}
              </Button>
            </Link>
            <Link href={`/classroom/${params.id}/attendance`} className="w-full sm:w-auto">
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                {dbUser?.role === 'PROFESSOR' ? 'Manage Attendance' : 'Attendance'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="assignments" className="mb-8">
        <TabsList className="flex flex-wrap justify-center md:justify-around gap-2 mb-8">
          <TabsTrigger value="assignments" className="flex-grow sm:flex-grow-0">Assignments</TabsTrigger>
          <TabsTrigger value="grades" className="flex-grow sm:flex-grow-0">Grades</TabsTrigger>
          <TabsTrigger value="code-execution" className="flex-grow sm:flex-grow-0">Code Execution</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments">
          <AssignmentsTab
            assignments={assignments}
            submissions={submissions}
            classroomId={params.id as string}
            userRole={dbUser?.role}
            onCreateAssignment={handleCreateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            isCreatingAssignment={isCreatingAssignment}
            isLoading={isLoadingAssignments}
          />
        </TabsContent>
        <TabsContent value="grades">
          <GradesTab
            submissions={submissions}
            assignments={assignments}
            userId={clerkUser?.id}
          />
        </TabsContent>
        <TabsContent value="code-execution">
          <CodeExecution />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassroomPage;
