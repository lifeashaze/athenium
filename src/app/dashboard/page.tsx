'use client'
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ClipLoader } from 'react-spinners';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
        <div className="grid md:grid-cols-1 gap-8">
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
              <CardTitle>Your Classrooms</CardTitle>
            </CardHeader>
            <CardContent>
              {classrooms.length === 0 ? (
                <p>You havent created any classrooms yet.</p>
              ) : (
                <ul className="space-y-4">
                  {classrooms.map((classroom) => (
                    <li key={classroom.id} className="flex justify-between items-center">
                      <span>{classroom.name} (Code: {classroom.code})</span>
                      <Button onClick={() => router.push(`/classroom/${classroom.id}`)}>
                        View Classroom
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;