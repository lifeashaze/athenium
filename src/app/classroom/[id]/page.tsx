'use client'

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AssignmentsTab } from '@/components/classroom/AssignmentsTab';
import { Users, BookOpen } from 'lucide-react';
import { useDbUser } from '@/lib/hooks/useUser';
import {
  Assignment,
  useClassroom,
  useClassroomAssignments,
  useClassroomSubmissions,
} from '@/lib/hooks/useClassroom';

const GradesTab = dynamic(
  () => import('@/components/classroom/GradesTab').then((mod) => mod.GradesTab),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </CardContent>
      </Card>
    ),
  }
);

const ClassroomPage = () => {
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { dbUser, isLoading: isDbUserLoading } = useDbUser();
  const params = useParams();
  const classroomId = Array.isArray(params.id) ? params.id[0] : params.id;
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');

  const queriesEnabled = isUserLoaded && !!clerkUser && !!classroomId;
  const classroomQuery = useClassroom(classroomId, queriesEnabled);
  const assignmentsQuery = useClassroomAssignments(classroomId, queriesEnabled);
  const submissionsQuery = useClassroomSubmissions(
    classroomId,
    queriesEnabled && activeTab === 'grades'
  );

  const classroom = classroomQuery.data;
  const assignments = assignmentsQuery.data ?? [];
  const submissions = submissionsQuery.data ?? [];

  const handleCreateAssignment = useCallback(async (newAssignment: any): Promise<Assignment | null> => {
    if (!classroomId) return null;

    try {
      setIsCreatingAssignment(true);
      
      const formattedDeadline = newAssignment.deadline.toISOString();
      const response = await axios.post(`/api/classrooms/${classroomId}/assignments`, {
        ...newAssignment,
        deadline: formattedDeadline,
      });
      const createdAssignment = response.data;
      
      queryClient.setQueryData<Assignment[]>(['classroom', classroomId, 'assignments'], (current = []) => [
        ...current,
        createdAssignment,
      ]);

      await axios.post(`/api/classrooms/${classroomId}/notify`, {
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
  }, [classroomId, queryClient]);


  const handleDeleteAssignment = useCallback(async (assignmentId: number): Promise<boolean> => {
    if (!classroomId) return false;

    try {
      await axios.delete(`/api/classrooms/${classroomId}/assignments/${assignmentId}`);
      queryClient.setQueryData<Assignment[]>(['classroom', classroomId, 'assignments'], (current = []) =>
        current.filter((assignment) => assignment.id !== assignmentId)
      );
      return true;
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      setError('Failed to delete assignment. Please try again.');
      return false;
    }
  }, [classroomId, queryClient]);

  const handleUpdateAssignment = useCallback(async (assignmentId: number, updatedData: Partial<Assignment>): Promise<boolean> => {
    if (!classroomId) return false;

    try {
      const formattedData = {
        ...updatedData,
        deadline: updatedData.deadline 
          ? (typeof updatedData.deadline === 'string' 
              ? updatedData.deadline 
              : new Date(updatedData.deadline).toISOString())
          : new Date().toISOString()
      };

      await axios.put(`/api/classrooms/${classroomId}/assignments/${assignmentId}`, formattedData);

      queryClient.setQueryData<Assignment[]>(['classroom', classroomId, 'assignments'], (current = []) =>
        current.map((assignment) =>
          assignment.id === assignmentId
          ? { ...assignment, ...updatedData, deadline: formattedData.deadline }
          : assignment
        )
      );
      
      return true;
    } catch (error) {
      console.error('Failed to update assignment:', error);
      setError('Failed to update assignment. Please try again.');
      return false;
    }
  }, [classroomId, queryClient]);

  if (!isUserLoaded || classroomQuery.isLoading || isDbUserLoading) {
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

  if (classroomQuery.isError) return <p className="text-center text-xl mt-10 text-red-500">Failed to load classroom data. Please try again later.</p>;

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
            <Link href={`/classroom/${classroomId}/resources`} className="w-full sm:w-auto">
              <Button className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                {dbUser?.role === 'PROFESSOR' ? 'Manage Resources' : 'Resources'}
              </Button>
            </Link>
            {dbUser?.role !== 'STUDENT' && (
              <Link href={`/classroom/${classroomId}/attendance`} className="w-full sm:w-auto">
                <Button className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  {dbUser?.role === 'PROFESSOR' ? 'Manage Attendance' : 'Attendance'}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="flex flex-wrap justify-center md:justify-around gap-2 mb-8">
          <TabsTrigger value="assignments" className="flex-grow sm:flex-grow-0">Assignments</TabsTrigger>
          <TabsTrigger value="grades" className="flex-grow sm:flex-grow-0">Grades</TabsTrigger>
        </TabsList>
        <TabsContent value="assignments">
          <AssignmentsTab
            assignments={assignments}
            submissions={[]}
            classroomId={classroomId as string}
            userRole={dbUser?.role}
            onCreateAssignment={handleCreateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            isCreatingAssignment={isCreatingAssignment}
            isLoading={assignmentsQuery.isLoading}
          />
        </TabsContent>
        <TabsContent value="grades">
          {submissionsQuery.isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full rounded-lg" />
              </CardContent>
            </Card>
          ) : (
            <GradesTab
              submissions={submissions}
              assignments={assignments}
              userId={clerkUser?.id}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassroomPage;
