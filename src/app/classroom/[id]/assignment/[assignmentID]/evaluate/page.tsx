'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

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

const EvaluationClient = () => {
  const params = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [params.id, params.assignmentID]);

  const fetchSubmissions = async () => {
    if (!params.id || !params.assignmentID) {
      setError('Invalid classroom or assignment ID');
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      const response = await axios.get(`/api/classrooms/${params.id}/assignments/${params.assignmentID}/submissions`);
      setSubmissions(response.data);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setError('Failed to load submissions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Submissions</CardTitle>
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
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.user.firstName}</TableCell>
                    <TableCell>{submission.user.email}</TableCell>
                    <TableCell>{new Date(submission.submittedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <Link href={submission.content} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          View Submission
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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