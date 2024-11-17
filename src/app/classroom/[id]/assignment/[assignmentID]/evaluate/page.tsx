'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Skeleton } from "@/components/ui/skeleton"
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

const getPreviewUrl = (submissionUrl: string) => {
  const fileExtension = submissionUrl.split('.').pop()?.toLowerCase();
  const officeExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];
  
  if (officeExtensions.includes(fileExtension || '')) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(submissionUrl)}`;
  }
  return `${submissionUrl}#toolbar=0`;
};

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
  const [isSaving, setIsSaving] = useState(false);
  const [sortedSubmissions, setSortedSubmissions] = useState<Submission[]>([]);
  const { toast } = useToast();

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
      
      const initialSortedSubmissions = sortModalSubmissions(submissionsResponse.data);
      setSubmissions(submissionsResponse.data);
      setSortedSubmissions(initialSortedSubmissions);
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

  // Helper function to sort submissions (unevaluated first, then by roll number)
  const sortModalSubmissions = (submissions: Submission[]) => {
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

  const handleNextSubmission = () => {
    if (selectedSubmissionIndex !== null) {
      const filteredSubmissions = filterSubmissions(sortedSubmissions, modalSearchTerm);
      
      if (selectedSubmissionIndex < filteredSubmissions.length - 1) {
        const nextIndex = selectedSubmissionIndex + 1;
        setSelectedSubmissionIndex(nextIndex);
        setSelectedSubmission(filteredSubmissions[nextIndex]);
        setMarks(filteredSubmissions[nextIndex].marks || null);
      }
    }
  };

  const handlePreviousSubmission = () => {
    if (selectedSubmissionIndex !== null && selectedSubmissionIndex > 0) {
      const filteredSubmissions = filterSubmissions(sortedSubmissions, modalSearchTerm);
      
      const prevIndex = selectedSubmissionIndex - 1;
      setSelectedSubmissionIndex(prevIndex);
      setSelectedSubmission(filteredSubmissions[prevIndex]);
      setMarks(filteredSubmissions[prevIndex].marks || null);
    }
  };

  const handleMarksUpdate = async (submissionId: number, marks: number) => {
    try {
      setIsSaving(true);
      await axios.patch(`/api/submissions/${submissionId}/marks`, { marks });
      
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId ? { ...sub, marks } : sub
      );
      const updatedSortedSubmissions = sortedSubmissions.map(sub => 
        sub.id === submissionId ? { ...sub, marks } : sub
      );
      
      setSubmissions(updatedSubmissions);
      setSortedSubmissions(updatedSortedSubmissions);
      
      toast({
        title: "Marks Updated",
        description: "The marks have been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to update marks:', error);
      toast({
        title: "Error",
        description: "Failed to update marks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getEvaluationStatus = (marks: number | null | undefined) => {
    if (marks === null || marks === undefined || marks === 0) {
      return 'Not Evaluated';
    }
    return 'Evaluated';
  };

  return (
    <div className="container mx-auto py-6">
      {/* Assignment Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{assignment?.title}</h1>
        <div className="flex items-center gap-6">
          <p className="text-sm text-muted-foreground">
            Due: {assignment && formatDate(assignment.deadline)}
          </p>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-sm text-muted-foreground mr-2">Total Submissions:</span>
              <span className="font-medium">{submissions.length}</span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground mr-2">Evaluated:</span>
              <span className="font-medium">
                {submissions.filter(s => s.marks !== null && s.marks !== undefined && s.marks > 0).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div>
          {/* Assignment Info Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-8 w-[300px] mb-2" />
            <div className="flex items-center gap-6">
              <Skeleton className="h-4 w-[200px]" />
              <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          </div>

          {/* Search and Button Skeleton */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Skeleton className="h-10 w-full max-w-md" />
            <Skeleton className="h-10 w-[180px]" />
          </div>

          {/* Table Skeleton */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(6)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination Skeleton */}
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
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
                    const filteredSubmissions = filterSubmissions(sortedSubmissions, modalSearchTerm);
                    const firstUnevaluatedIndex = filteredSubmissions.findIndex(
                      sub => !sub.marks || sub.marks === 0
                    );
                    const initialIndex = firstUnevaluatedIndex !== -1 ? firstUnevaluatedIndex : 0;
                    setSelectedSubmission(filteredSubmissions[initialIndex]);
                    setSelectedSubmissionIndex(initialIndex);
                    setMarks(filteredSubmissions[initialIndex]?.marks || null);
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
                      {filterSubmissions(sortedSubmissions, modalSearchTerm)
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
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{`${selectedSubmission?.user.firstName} ${selectedSubmission?.user.lastName || ''}`}</h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {selectedSubmission && formatDate(selectedSubmission.submittedAt)}
                        </p>
                      </div>

                      {/* Marks Input */}
                      <div className="flex items-center gap-4">
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
                            disabled={marks === null || isSaving}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isSaving ? (
                              <>
                                <span className="animate-spin mr-2">⭮</span>
                                Saving...
                              </>
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Submission View */}
                    <iframe
                      src={selectedSubmission?.content ? getPreviewUrl(selectedSubmission.content) : ''}
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

          {/* Pagination - Moved here */}
          <div className="flex justify-center mb-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="cursor-pointer"
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => setCurrentPage(index + 1)}
                      isActive={currentPage === index + 1}
                      className="cursor-pointer"
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          {/* Table Card */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="w-[50px]">Status</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.user.rollNo || 'N/A'}</TableCell>
                      <TableCell>{`${submission.user.firstName} ${submission.user.lastName}`}</TableCell>
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
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const submissionIndex = sortedSubmissions.findIndex(
                                  sub => sub.id === submission.id
                                );
                                setSelectedSubmission(submission);
                                setSelectedSubmissionIndex(submissionIndex);
                                setMarks(submission.marks || null);
                                setModalSearchTerm('');
                              }}
                            >
                              View
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
                                  {filterSubmissions(sortedSubmissions, modalSearchTerm)
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
                                <div className="flex justify-between items-center mb-4">
                                  <div>
                                    <h3 className="text-lg font-semibold">{`${selectedSubmission?.user.firstName} ${selectedSubmission?.user.lastName || ''}`}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Submitted: {selectedSubmission && formatDate(selectedSubmission.submittedAt)}
                                    </p>
                                  </div>

                                  {/* Marks Input */}
                                  <div className="flex items-center gap-4">
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
                                        disabled={marks === null || isSaving}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        {isSaving ? (
                                          <>
                                            <span className="animate-spin mr-2">⭮</span>
                                            Saving...
                                          </>
                                        ) : (
                                          'Save'
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Submission View */}
                                <iframe
                                  src={selectedSubmission?.content ? getPreviewUrl(selectedSubmission.content) : ''}
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {submissions.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No submissions yet for this assignment.</p>
        </div>
      )}
    </div>
  );
};

export default EvaluationClient;
