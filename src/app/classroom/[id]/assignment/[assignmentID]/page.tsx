'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Assignment {
  id: number;
  title: string;
  type: 'theory' | 'lab';
  deadline: string;
  classroom: {
    id: number;
    name: string;
  };
  submissions: Array<{
    id: number;
    content: string;
  }>;
}

const AssignmentPage = () => {
  const params = useParams();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AssignmentPage mounted');
    console.log('Params:', params);

    const fetchAssignment = async () => {
      console.log('Fetching assignment...');
      setIsLoading(true);
      try {
        const url = `/api/classrooms/${params.id}/assignments/${params.assignmentID}`;
        console.log('Fetch URL:', url);
        const response = await axios.get<Assignment>(url);
        console.log('Assignment data:', response.data);
        setAssignment(response.data);
      } catch (error) {
        console.error('Failed to fetch assignment:', error);
        setError('Failed to load assignment. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id && params.assignmentID) {
      fetchAssignment();
    } else {
      console.log('Missing params:', { id: params.id, assignmentID: params.assignmentID });
      setIsLoading(false);
    }
  }, [params.id, params.assignmentID]);

  console.log('Render state:', { isLoading, error, assignment });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`/api/classrooms/${params.id}/assignments/${params.assignmentID}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      setError('Failed to submit assignment. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!assignment) return <p>No assignment found.</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{assignment.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Type:</strong> {assignment.type}</p>
          <p><strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleString()}</p>
          {assignment.submissions.length > 0 && (
            <p><strong>Submitted:</strong> Yes</p>
          )}
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="file">Upload Assignment</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
            </div>
            <Button type="submit" className="mt-4" disabled={!file || isUploading}>
              {isUploading ? 'Uploading...' : 'Submit Assignment'}
            </Button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentPage;