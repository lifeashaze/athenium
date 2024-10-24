'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast"

interface Student {
  id: string;
  firstName: string;
  email: string;
  lastName: string;
  rollNo: string;
  srn: string;
  prn: string;
}

interface Submission {
  id: number;
  submittedAt: string;
  content: string;
  userId: string;
  user: {
    firstName: string;
    email: string;
    lastName: string;
    rollNo: string;
    srn: string;
    prn: string;
  };
  marks?: number;
}

interface Assignment {
  title: string;
  deadline: string;
  maxMarks?: number;
}

const EvaluationClient = () => {
  const params = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState<number | null>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [marks, setMarks] = useState<number | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast()

  useEffect(() => {
    fetchAssignmentAndSubmissions();
    fetchStudents();
  }, [params.id, params.assignmentID]);

  const fetchAssignmentAndSubmissions = async () => {
    if (!params.id || !params.assignmentID) {
      setError('Invalid classroom or assignment ID');
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      const [assignmentResponse, submissionsResponse] = await Promise.all([
        axios.get(`/api/classrooms/${params.id}/assignments/${params.assignmentID}`),
        axios.get(`/api/classrooms/${params.id}/assignments/${params.assignmentID}/submissions`)
      ]);
      setAssignment(assignmentResponse.data);
      setSubmissions(submissionsResponse.data);
      console.log('Fetched submissions:', submissionsResponse.data); // Add this log
    } catch (err) {
      console.error('Failed to fetch assignment or submissions:', err);
      setError('Failed to load assignment or submissions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!params.id) {
      setError('Invalid classroom ID');
      return;
    }

    try {
      const response = await axios.get(`/api/classrooms/${params.id}`);
      setStudents(response.data.members || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students. Please try again later.');
    }
  };

  const getSubmissionStatus = (studentId: string) => {
    return submissions.some(submission => submission.userId === studentId);
  };

  const combinedStudents = students.map(student => ({
    ...student,
    hasSubmitted: getSubmissionStatus(student.id)
  }));

  const filterSubmissions = (submissions: Submission[], searchTerm: string) => {
    return submissions.filter(submission =>
      submission.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (submission.user.rollNo && submission.user.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const sortSubmissions = (submissions: Submission[]) => {
    return submissions.sort((a, b) => {
      // First, sort by evaluation status (unevaluated first)
      const aEvaluated = a.marks !== null && a.marks !== undefined && a.marks > 0;
      const bEvaluated = b.marks !== null && b.marks !== undefined && b.marks > 0;
      
      if (!aEvaluated && bEvaluated) return -1;
      if (aEvaluated && !bEvaluated) return 1;
      
      // If both are evaluated or both are not evaluated, sort by roll number
      const aRollNo = a.user.rollNo || '';
      const bRollNo = b.user.rollNo || '';
      return aRollNo.localeCompare(bRollNo);
    });
  };

  const filteredAndSortedSubmissions = sortSubmissions(filterSubmissions(submissions, searchTerm));
  const paginatedSubmissions = filteredAndSortedSubmissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAndSortedSubmissions.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleNextSubmission = async () => {
    if (selectedSubmissionIndex !== null && selectedSubmissionIndex < submissions.length - 1) {
      // Save current marks before moving to next submission
      if (selectedSubmission && marks !== null) {
        await handleMarksUpdate(selectedSubmission.id, marks);
      }
      
      // Move to next submission
      const nextIndex = selectedSubmissionIndex + 1;
      setSelectedSubmissionIndex(nextIndex);
      const nextSubmission = submissions[nextIndex];
      setSelectedSubmission(nextSubmission);
      setMarks(nextSubmission.marks || null);
    }
  };

  const handlePreviousSubmission = () => {
    if (selectedSubmissionIndex !== null && selectedSubmissionIndex > 0) {
      setSelectedSubmissionIndex(selectedSubmissionIndex - 1);
      setSelectedSubmission(submissions[selectedSubmissionIndex - 1]);
    }
  };

  const handleMarksUpdate = async (submissionId: number, marks: number) => {
    try {
      setUpdateStatus('idle'); // Reset status before update
      await axios.patch(`/api/submissions/${submissionId}/marks`, { marks });
      // Update the local state
      setSubmissions(submissions.map(sub => 
        sub.id === submissionId ? { ...sub, marks } : sub
      ));
      setUpdateStatus('success');
    } catch (error) {
      console.error('Failed to update marks:', error);
      setUpdateStatus('error');
    }

    // Reset status after 3 seconds
    setTimeout(() => setUpdateStatus('idle'), 3000);
  };

  const getEvaluationStatus = (marks: number | null | undefined) => {
    if (marks === null || marks === undefined || marks === 0) {
      return 'Not Evaluated';
    }
    return 'Evaluated';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="border-b bg-white">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{assignment?.title}</h1>
              <p className="text-sm text-muted-foreground">Due: {assignment && formatDate(assignment.deadline)}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-xl font-semibold">{submissions.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Evaluated</p>
                <p className="text-xl font-semibold">
                  {submissions.filter(s => s.marks !== null && s.marks !== undefined && s.marks > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6">
        {isLoading && (
          <div className="flex justify-center items-center mt-4">
            <ClipLoader size={30} color={"#123abc"} loading={true} />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {submissions.length > 0 && (
          <div className="space-y-6">
            {/* Search and Filters Row */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  type="text"
                  placeholder="Search by name, email, or roll number"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setSelectedSubmission(submissions[0]);
                      setSelectedSubmissionIndex(0);
                      setMarks(submissions[0]?.marks || null);
                    }}
                  >
                    Evaluate Submissions
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] w-full max-h-[90vh] h-full p-0">
                  <DialogHeader className="px-4 py-2 border-b">
                    <DialogTitle>Submission Details</DialogTitle>
                  </DialogHeader>
                  <div className="flex h-[calc(90vh-60px)]">
                    {/* Left Sidebar - Submission List */}
                    <div className="w-80 border-r p-4">
                      <h3 className="font-semibold mb-2">All Submissions</h3>
                      <div className="relative mb-2">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                          type="text"
                          placeholder="Search students"
                          value={modalSearchTerm}
                          onChange={(e) => setModalSearchTerm(e.target.value)}
                          className="pl-8 py-1 text-sm"
                        />
                      </div>
                      <ScrollArea className="h-[calc(100%-60px)]">
                        {filterSubmissions(submissions, modalSearchTerm)
                          .sort((a, b) => {
                            const aRollNo = a.user.rollNo || '';
                            const bRollNo = b.user.rollNo || '';
                            return aRollNo.localeCompare(bRollNo);
                          })
                          .map((submission, idx) => {
                            const isSelected = selectedSubmission?.id === submission.id;
                            return (
                              <Button
                                key={submission.id}
                                variant={isSelected ? "secondary" : "ghost"}
                                className={`w-full justify-start mb-2 ${isSelected ? 'border-2 border-primary' : ''}`}
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setSelectedSubmissionIndex(idx);
                                  setMarks(submission.marks || null);
                                }}
                              >
                                <div className="flex items-center w-full">
                                  <span className="flex-grow text-left">
                                    {submission.user.rollNo || 'N/A'} - {submission.user.firstName}
                                  </span>
                                  {submission.marks !== null && submission.marks !== undefined && submission.marks > 0 ? (
                                    <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                                  ) : (
                                    <XCircle className="w-4 h-4 text-red-500 ml-2" />
                                  )}
                                </div>
                              </Button>
                            );
                          })}
                      </ScrollArea>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col p-4">
                      {/* Student Info Header */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold">Full Name</h3>
                          <p>{`${selectedSubmission?.user.firstName} ${selectedSubmission?.user.lastName || ''}`}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Email</h3>
                          <p>{selectedSubmission?.user.email}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Roll Number</h3>
                          <p>{selectedSubmission?.user.rollNo || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">SRN</h3>
                          <p>{selectedSubmission?.user.srn || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">PRN</h3>
                          <p>{selectedSubmission?.user.prn || 'N/A'}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Submitted At</h3>
                          <p>{selectedSubmission && formatDate(selectedSubmission.submittedAt)}</p>
                        </div>
                      </div>

                      {/* Marks Input */}
                      <div className="flex items-center gap-4 mb-4">
                        <Label htmlFor="marks" className="font-semibold">
                          Marks (out of {assignment?.maxMarks})
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Input
                              id="marks"
                              type="number"
                              min="0"
                              max={assignment?.maxMarks}
                              value={marks ?? ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? null : 
                                  Math.min(
                                    Math.max(0, parseInt(e.target.value) || 0),
                                    assignment?.maxMarks || 0
                                  );
                                setMarks(value);
                              }}
                              className="w-20 text-center pr-8"
                              placeholder="-"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              / {assignment?.maxMarks}
                            </span>
                          </div>
                          <Button 
                            onClick={() => selectedSubmission && marks !== null && handleMarksUpdate(selectedSubmission.id, marks)}
                            size="sm"
                            disabled={marks === null}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Save
                          </Button>
                          {updateStatus === 'success' && (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">Saved</span>
                            </div>
                          )}
                          {updateStatus === 'error' && (
                            <div className="flex items-center text-red-600">
                              <XCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">Error</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submission View */}
                      <iframe
                        src={`${selectedSubmission?.content}#toolbar=0`}
                        className="flex-grow w-full rounded-lg border shadow-sm"
                        title={`Submission by ${selectedSubmission?.user.firstName}`}
                      />

                      {/* Navigation Buttons */}
                      <div className="flex justify-between mt-4">
                        <Button
                          onClick={handlePreviousSubmission}
                          disabled={selectedSubmissionIndex === 0}
                          variant="outline"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          onClick={handleNextSubmission}
                          disabled={selectedSubmissionIndex === submissions.length - 1}
                          variant="outline"
                        >
                          Next
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Table Card */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead className="w-[50px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>{submission.user.rollNo || 'N/A'}</TableCell>
                        <TableCell>{`${submission.user.firstName} ${submission.user.lastName}`}</TableCell>
                        <TableCell>{submission.user.email}</TableCell>
                        <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                        <TableCell>
                          {submission.marks !== null && submission.marks !== undefined && submission.marks > 0
                            ? submission.marks
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {submission.marks !== null && submission.marks !== undefined && submission.marks > 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}

        {submissions.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 inline-block">
              <p className="text-lg text-muted-foreground">No submissions yet for this assignment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationClient;
