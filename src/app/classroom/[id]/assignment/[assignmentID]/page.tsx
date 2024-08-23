'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
        if (response.data.submissions.length > 0) {
          setSubmissionUrl(response.data.submissions[0].content);
        }
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `/api/classrooms/${params.id}/assignments/${params.assignmentID}/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1));
            setUploadProgress(percentCompleted);
          },
        }
      );

      alert('Assignment submitted successfully!');
      setSubmissionUrl(response.data.content);
      setFile(null); // Reset file input
      router.refresh(); // Refresh the page
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      setError('Failed to submit assignment. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [file, params.id, params.assignmentID, router]);

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
          {submissionUrl && (
            <div>
              <p>Current submission:</p>
              <Link href={submissionUrl} target="_blank" rel="noopener noreferrer">
                <button>
                  View Submission
                </button>
              </Link>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="file">Upload Assignment</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
            </div>
            <Button type="submit" className="mt-4" disabled={!file || isUploading}>
              {submissionUrl ? 'Replace Submission' : 'Submit Assignment'}
            </Button>
          </form>
          {isUploading && (
            <div>
              <progress value={uploadProgress} max="100" />
              <p>{uploadProgress}% uploaded</p>
            </div>
          )}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentPage;