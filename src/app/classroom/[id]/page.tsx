'use client'

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarDemo } from '@/components/Sidebar';

interface Classroom {
  id: number;
  name: string;
  code: string;
  inviteLink: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Assignment {
  id: number;
  title: string;
  deadline: string;
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
  const [newAssignment, setNewAssignment] = useState({ title: '', deadline: '' });

  const fetchClassroomData = async () => {
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
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`/api/classrooms/${params.id}/assignments`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      setError('Failed to load assignments. Please try again later.');
    }
  };

  useEffect(() => {
    if (isUserLoaded && user && params.id) {
      fetchClassroomData();
      fetchAssignments();
    }
  }, [isUserLoaded, user, params.id]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedDeadline = new Date(newAssignment.deadline).toISOString();
      await axios.post(`/api/classrooms/${params.id}/assignments`, {
        ...newAssignment,
        deadline: formattedDeadline
      });
      // Fetch assignments after creating a new one
      await fetchAssignments();
      setIsDialogOpen(false);
      setNewAssignment({ title: '', deadline: '' });
    } catch (error) {
      console.error('Failed to create assignment:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create assignment. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

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
    <div className="flex h-screen bg-gray-100">
    <SidebarDemo />
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">{classroom.name}</h1>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Classroom Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>ID:</strong> {classroom.id}</p>
                <p><strong>Code:</strong> {classroom.code}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Members</CardTitle>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <ul>
                    {members.map((member) => (
                      <li key={member.id}>{member.name} ({member.email})</li>
                    ))}
                  </ul>
                ) : (
                  <p>No members in this classroom yet.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length > 0 ? (
                  <ul>
                    {assignments.map((assignment) => (
                      <li key={assignment.id}>{assignment.title} (Due: {new Date(assignment.deadline).toLocaleDateString()})</li>
                    ))}
                  </ul>
                ) : (
                  <p>No assignments yet.</p>
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
                            Title
                          </Label>
                          <Input
                            id="title"
                            value={newAssignment.title}
                            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="deadline" className="text-right">
                            Deadline
                          </Label>
                          <Input
                            id="deadline"
                            type="date"
                            value={newAssignment.deadline}
                            onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  </div>
  );
};

export default ClassroomPage;