"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FolderOpen, Clock, User, FileText, Filter } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface Resource {
  id: string;
  title: string;
  category: string | null;
  uploadedAt: string;
  uploader: {
    firstName: string;
    lastName: string;
  };
}

interface Classroom {
  id: string;
  name: string;
  courseCode: string;
  courseName: string;
  year: string;
  division: string;
  resources: Resource[];
}

type DownloadStage = {
  status: 'preparing' | 'downloading' | 'zipping' | 'complete' | 'error';
  progress: number;
  message: string;
};

export default function ResourcesPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [downloadingClassroom, setDownloadingClassroom] = useState<string | null>(null);
  const [downloadStage, setDownloadStage] = useState<DownloadStage | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources');
        if (!response.ok) throw new Error('Failed to fetch resources');
        const data = await response.json();
        
        if (data.message) {
          setMessage(data.message);
          setClassrooms([]);
        } else {
          setClassrooms(data.classrooms);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resources');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredClassrooms = useMemo(() => {
    return selectedYear === "all"
      ? classrooms
      : classrooms.filter(classroom => classroom.year === selectedYear);
  }, [classrooms, selectedYear]);

  const handleDownload = async (classroomId: string) => {
    try {
      setDownloadingClassroom(classroomId);
      
      // Step 1: Prepare
      setDownloadStage({
        status: 'preparing',
        progress: 10,
        message: '🔍 Gathering your knowledge...'
      });

      const prepareResponse = await fetch(
        `/api/resources?action=download&classroomId=${classroomId}&step=prepare`
      );
      if (!prepareResponse.ok) throw new Error('Preparation failed');
      const prepareData = await prepareResponse.json();
      
      // Step 2: Start Download
      setDownloadStage({
        status: 'downloading',
        progress: 25,
        message: `📚 Packing billions of bits of knowledge...`
      });

      // Add intermediate progress updates
      const progressInterval = setInterval(() => {
        setDownloadStage(current => {
          if (!current || current.status !== 'downloading') return current;
          return {
            ...current,
            progress: Math.min(current.progress + 5, 70),
            message: `📚 We're almost there...`
          };
        });
      }, 850);

      const response = await fetch(
        `/api/resources?action=download&classroomId=${classroomId}`
      );
      clearInterval(progressInterval);
      
      if (!response.ok) throw new Error('Download failed');
      
      const totalFiles = response.headers.get('X-Total-Files');
      const downloadedFiles = response.headers.get('X-Downloaded-Files');
      
      setDownloadStage({
        status: 'zipping',
        progress: 75,
        message: '🎁 Wrapping up your knowledge bundle...'
      });

      const blob = await response.blob();
      
      setDownloadStage({
        status: 'complete',
        progress: 90,
        message: '🚀 Preparing for takeoff...'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'classroom-resources.zip';
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setDownloadStage({
        status: 'complete',
        progress: 100,
        message: `✨ ${downloadedFiles} treasures successfully captured!`
      });
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStage({
        status: 'error',
        progress: 100,
        message: '💫 Oops! The knowledge escaped this time...'
      });
    } finally {
      setTimeout(() => {
        setDownloadingClassroom(null);
        setDownloadStage(null);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="container mx-auto min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <p className="text-lg text-muted-foreground mb-2">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Classroom Resources</h1>
        
        <Select 
          defaultValue="all" 
          onValueChange={(value) => setSelectedYear(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClassrooms.map((classroom) => (
          <Card key={classroom.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{classroom.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{classroom.courseName}</p>
                  <p className="text-sm text-muted-foreground">{classroom.courseCode}</p>
                </div>
                <Badge variant="secondary">
                  {classroom.year} - {classroom.division}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-medium">
                    {classroom.resources.length} {classroom.resources.length === 1 ? 'Resource' : 'Resources'}
                  </p>
                  <Badge variant="outline" className="ml-2">
                    {classroom.resources.filter(r => r.category === "Lecture Notes").length} Lectures
                  </Badge>
                </div>
                
                {/* Latest Resource Preview */}
                {classroom.resources[0] && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium">Latest Upload:</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm truncate">{classroom.resources[0].title}</p>
                      <div className="flex items-center text-xs text-muted-foreground gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(classroom.resources[0].uploadedAt).toLocaleDateString()}
                        <User className="h-3 w-3 ml-2" />
                        {`${classroom.resources[0].uploader.firstName} ${classroom.resources[0].uploader.lastName}`}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3">
              {downloadingClassroom === classroom.id && downloadStage && (
                <div className="w-full space-y-2 mb-2">
                  <Progress value={downloadStage.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{downloadStage.message}</span>
                    <span>{downloadStage.progress}%</span>
                  </div>
                </div>
              )}
              
              <div className="flex w-full gap-2">
                <Link href={`/classroom/${classroom.id}/resources`} className="flex-1">
                  <Button className="w-full" variant="default">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">View Resources</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDownload(classroom.id)}
                  disabled={downloadingClassroom === classroom.id}
                >
                  {downloadingClassroom === classroom.id ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Downloading...</span>
                      <span className="sm:hidden">...</span>
                    </div>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Download All</span>
                      <span className="sm:hidden">Download</span>
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}