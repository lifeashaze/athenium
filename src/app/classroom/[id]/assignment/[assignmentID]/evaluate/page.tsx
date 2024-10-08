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
                  {paginatedStudents.map((student) => {
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
                            <Link href={submission.content} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm">
                                View Submission
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
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