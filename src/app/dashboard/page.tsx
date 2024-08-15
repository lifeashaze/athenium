'use client'
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from '@/components/Header';
import { Trash2 } from 'lucide-react';
import { SidebarDemo } from '@/components/Sidebar';

interface Classroom {
  id: number;
  name: string;
  code: string;
}

const Dashboard: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchClassrooms();
    } else if (isLoaded) {
      setIsPageLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const fetchClassrooms = async () => {
    try {
      const response = await axios.get('/api/classrooms');
      setClassrooms(response.data);
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classrooms",
      });
    } finally {
      setIsPageLoading(false);
    }
  };

  const createClassroom = async () => {
    if (!name.trim()) {
      setCreateError("Classroom name cannot be empty");
      return;
    }
    setCreateError(null);
    setIsCreating(true);
    try {
      const res = await axios.post('/api/classrooms/create', { name }, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      const classroom = res.data;
      
      toast({
        variant: "default",
        title: "Success",
        description: `Classroom "${classroom.name}" created successfully`,
      });
      
      setClassrooms([...classrooms, classroom]);
      setName('');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create classroom",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const joinClassroom = async () => {
    if (!joinCode.trim()) {
      setJoinError("Join code cannot be empty");
      return;
    }
    setJoinError(null);
    setIsJoining(true);
    try {
      const res = await axios.post('/api/classrooms/join', { code: joinCode }, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      const classroom = res.data;
      
      toast({
        variant: "default",
        title: "Success",
        description: `Joined classroom "${classroom.name}" successfully`,
      });
      
      setJoinCode('');
      // Optionally, you can refresh the classrooms list or redirect to the joined classroom
      // fetchClassrooms();
      // router.push(`/classroom/${classroom.id}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join classroom",
      });
    } finally {
      setIsJoining(false);
    }
  };
  const deleteClassroom = async (classroomId: number) => {
    try {
      await axios.delete(`/api/classrooms/${classroomId}`);
      setClassrooms(classrooms.filter(classroom => classroom.id !== classroomId));
      toast({
        variant: "default",
        title: "Success",
        description: "Classroom deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete classroom",
      });
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    );
  }

  if (!isSignedIn) {
    return <p className="text-center text-xl mt-10">You need to be logged in</p>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarDemo />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 py-8">
            <div className='text-center font-extralight m-10'>
            <h1 className="text-4xl">
              {(() => {
                const hour = new Date().getHours();
                if (hour >= 5 && hour < 12) return "Good Morning";
                if (hour >= 12 && hour < 18) return "Good Afternoon";
                if (hour >= 18 && hour < 22) return "Good Evening";
                return "Happy Night";
              })()}, {user?.firstName}
            </h1>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Create Classroom</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setCreateError(null);
                      }}
                      placeholder="Classroom Name"
                    />
                    {createError && (
                      <Alert variant="destructive">
                        <AlertDescription>{createError}</AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      onClick={createClassroom} 
                      className="w-full"
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create Classroom'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Join Classroom</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value);
                        setJoinError(null);
                      }}
                      placeholder="Classroom Code"
                    />
                    {joinError && (
                      <Alert variant="destructive">
                        <AlertDescription>{joinError}</AlertDescription>
                      </Alert>
                    )}
                    <Button 
                      onClick={joinClassroom} 
                      className="w-full"
                      disabled={isJoining}
                    >
                      {isJoining ? 'Joining...' : 'Join Classroom'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Classrooms</CardTitle>
              </CardHeader>
              <CardContent>
                {classrooms.length === 0 ? (
                  <p>You haven&apos;t created any classrooms yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {classrooms.map((classroom) => (
                      <li key={classroom.id} className="flex justify-between items-center">
                        <span>{classroom.name} (Code: {classroom.code})</span>
                        <div className="space-x-2">
                          <Button onClick={() => router.push(`/classroom/${classroom.id}`)}>
                            View Classroom
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteClassroom(classroom.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;