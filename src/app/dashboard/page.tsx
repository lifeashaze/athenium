'use client'
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import axios from 'axios';
import { Header } from '@/components/Header';
import { ClipLoader } from 'react-spinners';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [name, setName] = useState<string>('');
  const [classroomCode, setClassroomCode] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
      toast({ title: "Success", description: "Classroom created successfully" });
      setName('');
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to create classroom", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const joinClassroom = async () => {
    setIsJoining(true);
    try {
      const res = await axios.post('/api/classrooms/join', { code: classroomCode }, {
        headers: { 'Content-Type': 'application/json' },
      });
      toast({ title: "Success", description: "Joined classroom successfully" });
      setClassroomCode('');
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to join classroom", variant: "destructive" });
    } finally {
      setIsJoining(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={!isLoaded} />
      </div>
    );
  }

  if (!user) return <p className="text-center text-xl mt-10">You need to be logged in</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-8">
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
                  value={classroomCode}
                  onChange={(e) => setClassroomCode(e.target.value)}
                  placeholder="Classroom Code"
                />
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
      </main>
    </div>
  );
};

export default Dashboard;