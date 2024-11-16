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

export default function ResourcesPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [downloadingClassroom, setDownloadingClassroom] = useState<string | null>(null);

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
      const response = await fetch(`/api/resources?action=download&classroomId=${classroomId}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'classroom-resources.zip';
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // You might want to show an error message to the user here
    } finally {
      setDownloadingClassroom(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading resources...</span>
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
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <p className="text-lg text-muted-foreground mb-2">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Classroom Resources</h1>
        
        <div className="flex gap-4">
          <Select defaultValue="all">
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
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            
            <CardFooter className="flex justify-between gap-2">
              <Link href={`/classroom/${classroom.id}/resources`} className="flex-1">
                <Button className="w-full" variant="default">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  View Resources
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleDownload(classroom.id)}
                disabled={downloadingClassroom === classroom.id}
              >
                {downloadingClassroom === classroom.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download All
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}