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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  email: string;
}

interface Submission {
  id: number;
  submittedAt: string;
  content: string;
  userId: string;
  user: {
    firstName: string;
    email: string;
  };
}

interface Assignment {
  title: string;
  deadline: string;
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

  const filteredStudents = combinedStudents.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleNextSubmission = () => {
    if (selectedSubmissionIndex !== null && selectedSubmissionIndex < submissions.length - 1) {
      setSelectedSubmissionIndex(selectedSubmissionIndex + 1);
      setSelectedSubmission(submissions[selectedSubmissionIndex + 1]);
    }
  };

  const handlePreviousSubmission = () => {
    if (selectedSubmissionIndex !== null && selectedSubmissionIndex > 0) {
      setSelectedSubmissionIndex(selectedSubmissionIndex - 1);
      setSelectedSubmission(submissions[selectedSubmissionIndex - 1]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Submissions</CardTitle>
          {assignment && (
            <div className="text-sm text-muted-foreground">
              <p><strong>Assignment:</strong> {assignment.title}</p>
              <p><strong>Due Date:</strong> {formatDate(assignment.deadline)}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center mt-4">
              <ClipLoader size={30} color={"#123abc"} loading={true} />
            </div>
          )}

          {error && (
            <p className="text-center text-red-500 mt-4">{error}</p>
          )}

          {submissions.length > 0 && (
            <>
              <Input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student, index) => {
                    const submission = submissions.find(s => s.userId === student.id);
                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.firstName}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          {student.hasSubmitted ? (
                            <Badge variant="outline">Submitted</Badge>
                          ) : (
                            <Badge variant="outline">Not Submitted</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {submission ? formatDate(submission.submittedAt) : '-'}
                        </TableCell>
                        <TableCell>
                          {submission && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setSelectedSubmissionIndex(submissions.findIndex(s => s.id === submission.id));
                                  }}
                                >
                                  View Submission
                                  <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full">
                                <DialogHeader>
                                  <DialogTitle>Submission Details</DialogTitle>
                                </DialogHeader>
                                <div className="flex h-[calc(95vh-100px)]">
                                  <div className="w-64 border-r pr-4">
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
                                      {students
                                        .filter(student => 
                                          student.firstName.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                                          student.email.toLowerCase().includes(modalSearchTerm.toLowerCase())
                                        )
                                        .map((student, idx) => {
                                          const submission = submissions.find(sub => sub.userId === student.id);
                                          const isSelected = selectedSubmission?.userId === student.id;
                                          return (
                                            <Button
                                              key={student.id}
                                              variant={isSelected ? "secondary" : "ghost"}
                                              className={`w-full justify-start mb-2 ${isSelected ? 'border-2 border-primary' : ''}`}
                                              onClick={() => {
                                                if (submission) {
                                                  setSelectedSubmission(submission);
                                                  setSelectedSubmissionIndex(submissions.findIndex(s => s.id === submission.id));
                                                }
                                              }}
                                              disabled={!submission}
                                            >
                                              <div className="flex items-center w-full">
                                                <span className="flex-grow text-left">{student.firstName}</span>
                                                {submission ? (
                                                  <Badge variant="outline" className="ml-2">Submitted</Badge>
                                                ) : (
                                                  <Badge variant="outline" className="ml-2 bg-gray-200 text-gray-600">Pending</Badge>
                                                )}
                                              </div>
                                            </Button>
                                          );
                                        })}
                                    </ScrollArea>
                                  </div>
                                  <div className="flex-1 pl-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                      <div>
                                        <h3 className="font-semibold">Student Name</h3>
                                        <p>{selectedSubmission?.user.firstName}</p>
                                      </div>
                                      <div>
                                        <h3 className="font-semibold">Email</h3>
                                        <p>{selectedSubmission?.user.email}</p>
                                      </div>
                                      <div>
                                        <h3 className="font-semibold">Submitted At</h3>
                                        <p>{selectedSubmission && formatDate(selectedSubmission.submittedAt)}</p>
                                      </div>
                                    </div>
                                    <div className="px-10">
                                      <iframe
                                        src={`${selectedSubmission?.content}#toolbar=0`}
                                        className="w-full h-[calc(95vh-250px)]"
                                        title={`Submission by ${selectedSubmission?.user.firstName}`}
                                      />
                                    </div>
                                    <div className="flex justify-between mt-4">
                                      <Button
                                        onClick={handlePreviousSubmission}
                                        disabled={selectedSubmissionIndex === 0}
                                      >
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Previous
                                      </Button>
                                      <Button
                                        onClick={handleNextSubmission}
                                        disabled={selectedSubmissionIndex === submissions.length - 1}
                                      >
                                        Next
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Pagination className="mt-4">
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
            </>
          )}

          {submissions.length === 0 && !isLoading && !error && (
            <p className="text-center text-muted-foreground mt-4">No submissions yet for this assignment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationClient;
