'use client'

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { format, formatDistanceToNow } from "date-fns";
import { Check, X, Upload, Eye, ChevronRight, ArrowLeft, HelpCircle, MessageSquare, Loader2 } from "lucide-react";
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, Download } from "lucide-react"

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
      email: ReactNode;
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
  const [error, setError] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });



  const isDeadlinePassed = useCallback(() => {
    if (!assignment) return false;
    const dueDate = new Date(assignment.deadline);
    return Date.now() > dueDate.getTime();
  }, [assignment]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isDeadlinePassed()) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `/api/classrooms/${params.id}/assignments/${params.assignmentID}/submit`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setSubmissionUrl(response.data.content);
      setFile(null);
      router.refresh();
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      setError('Failed to submit assignment. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [file, params.id, params.assignmentID, router, isDeadlinePassed]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!assignment) return <p>No assignment found.</p>;

  const dueDate = new Date(assignment.deadline);
  const timeRemaining = formatDistanceToNow(dueDate, { addSuffix: true });

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Grid container - make it stack on smaller screens */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Assignment details section */}
          <div className="order-2 lg:order-1 h-[60vh] lg:h-[calc(100vh-4rem)]">
            <Card className="h-full overflow-auto">
              <CardHeader className="border-b border-gray-200 sticky top-0 bg-card z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold">{assignment.title}</CardTitle>
                    <p className="mt-1 text-sm text-gray-500">
                      {assignment.classroom.name} •
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-1 cursor-help">
                              {assignment.classroom.creator.name}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Assignment Creator</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {assignment.description}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {assignment.requirements?.map((req, index) => (
                        <li key={index} className="text-muted-foreground">{req}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Due Date</h3>
                    <p className="text-muted-foreground mb-2">
                      {format(dueDate, "PPpp")} ({timeRemaining})
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Submission Status</h3>
                    <div className="flex items-center space-x-2">
                      {submissionUrl ? (
                        <>
                          <Check className="text-green-500" />
                          <span className="text-green-500">Submitted</span>
                        </>
                      ) : isDeadlinePassed() ? (
                        <>
                          <X className="text-red-500" />
                          <span className="text-red-500">Deadline Passed</span>
                        </>
                      ) : (
                        <>
                          <X className="text-red-500" />
                          <span className="text-red-500">Not Submitted</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!isDeadlinePassed() && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Label htmlFor="file-upload" className="block text-lg font-semibold mb-2">
                        Upload Submission
                      </Label>
                      <div
                        {...getRootProps()}
                        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
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
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {isUploading ? 'Submitting...' : submissionUrl ? 'Replace Submission' : 'Submit Assignment'}
                      </Button>
                    </form>
                  )}
                  {isDeadlinePassed() && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Submission Closed</AlertTitle>
                      <AlertDescription>The deadline for this assignment has passed. No further submissions are allowed.</AlertDescription>
                    </Alert>
                  )}
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PDF Viewer Section */}
          <div className="order-1 lg:order-2 h-[60vh] lg:h-[calc(100vh-4rem)] lg:sticky lg:top-4">
            <Card className="h-full">
              <CardHeader className="border-b border-gray-200 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold">Submission Preview</h3>
                  </div>
                  {submissionUrl && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={submissionUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      </Button>
                      {/* Add fullscreen button for mobile */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="lg:hidden"
                      >
                        <a href={submissionUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Full View</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                {submissionUrl ? (
                  <iframe
                    src={`${submissionUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-0 rounded-b-md bg-white"
                    title="Submission Preview"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground p-4">
                    <FileText className="w-12 h-12" />
                    <p className="text-center">
                      No submission yet.
                      {!isDeadlinePassed() && (
                        <span className="block mt-1">
                          Upload your work using the form {window.innerWidth < 1024 ? 'below' : 'on the left'}.
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;
