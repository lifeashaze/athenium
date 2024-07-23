'use client'

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Header } from '@/components/Header';

interface Classroom {
  id: number;  // Changed from string to number
  name: string;
  code: string;
  inviteLink: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const ClassroomPage = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const params = useParams();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassroomData = async () => {
      if (!params.id) return;

      try {
        const response = await axios.get(`/api/classrooms/${params.id}`);
        setClassroom(response.data.classroom);
        setMembers(response.data.members);
      } catch (err) {
        console.error('Failed to fetch classroom data:', err);
        setError('Failed to load classroom data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isUserLoaded && user) {
      fetchClassroomData();
    }
  }, [isUserLoaded, user, params.id]);

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
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">{classroom.name}</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Classroom Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>ID:</strong> {classroom.id}</p>
              <p><strong>Code:</strong> {classroom.code}</p>
              <p><strong>Invite Link:</strong> {classroom.inviteLink}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {members.map((member) => (
                  <li key={member.id}>{member.name} ({member.email})</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClassroomPage;