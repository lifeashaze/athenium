'use client'

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { format, formatDistanceToNow } from "date-fns";
import { Check, X, Upload, Eye, ChevronRight, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Assignment {
  id: number;
  title: string;
  type: 'theory' | 'lab';
  deadline: string;
  description: string;
  points: number;
  requirements: string[];
  classroom: {
    id: number;
    name: string;
    creator: {
      name: string;
    };
  };
  submissions: Array<{
    id: number;
    content: string;
  }>;
}
const AssignmentPage = () => {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      setIsLoading(true);
      try {
        const url = `/api/classrooms/${params.id}/assignments/${params.assignmentID}`;
        const response = await axios.get<Assignment>(url);
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
      setIsLoading(false);
    }
  }, [params.id, params.assignmentID]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1));
            setUploadProgress(percentCompleted);
          },
        }
      );

      setShowSuccessModal(true);
      setSubmissionUrl(response.data.content);
      setFile(null);
      router.refresh();
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

  const dueDate = new Date(assignment.deadline);
  const timeRemaining = formatDistanceToNow(dueDate, { addSuffix: true });
  const progress = Math.max(0, Math.min(100, (Date.now() - dueDate.getTime()) / (24 * 60 * 60 * 1000) * 100));

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto p-4">
            <nav className="text-sm breadcrumbs mb-4">
              <ul className="flex items-center space-x-2">
                <li><Link href="/classroom" className="text-muted-foreground hover:text-primary">Classrooms</Link></li>
                <ChevronRight className="w-4 h-4" />
                <li><Link href={`/classroom/${params.id}`} className="text-muted-foreground hover:text-primary">{assignment.classroom.name}</Link></li>
                <ChevronRight className="w-4 h-4" />
                <li className="text-primary font-medium">{assignment.title}</li>
              </ul>
            </nav>

            <Card className="w-full max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">{assignment.title}</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>{assignment.classroom.name}</span>
                  <span>•</span>

                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{assignment.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  {/* <ul className="list-disc pl-5 space-y-1">
                    {assignment.requirements.map((req, index) => (
                      <li key={index} className="text-muted-foreground">{req}</li>
                    ))}
                  </ul> */}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Due Date</h3>
                  <p className="text-muted-foreground mb-2">
                    {format(dueDate, "PPpp")} ({timeRemaining})
                  </p>
                  <Progress value={progress} className="w-full" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Submission Status</h3>
                  <div className="flex items-center space-x-2">
                    {submissionUrl ? (
                      <>
                        <Check className="text-green-500" />
                        <span className="text-green-500">Submitted</span>
                      </>
                    ) : (
                      <>
                        <X className="text-red-500" />
                        <span className="text-red-500">Not Submitted</span>
                      </>
                    )}
                  </div>
                </div>
                {submissionUrl && (
                  <Button variant="outline" className="flex items-center space-x-2" asChild>
                    <Link href={submissionUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4" />
                      <span>View Submission</span>
                    </Link>
                  </Button>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Label htmlFor="file-upload" className="block text-lg font-semibold mb-2">
                    Upload Submission
                  </Label>
                  <div 
                    {...getRootProps()} 
                    className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <input {...getInputProps()} id="file-upload" />
                    {file ? (
                      <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>
                    ) : (
                      <p className='text-muted-foreground'>{isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select a file'}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={!file || isUploading} className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    {submissionUrl ? 'Replace Submission' : 'Submit Assignment'}
                  </Button>
                  {isUploading && (
                    <div>
                      <Progress value={uploadProgress} className="w-full" />
                      <p>{uploadProgress}% uploaded</p>
                    </div>
                  )}
                </form>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Please ensure your submission is complete before the due date.
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
      
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🎉 Assignment Submitted! 🎉
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center text-lg">
            Great job! Your assignment has been successfully submitted. 👏
          </DialogDescription>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowSuccessModal(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentPage;