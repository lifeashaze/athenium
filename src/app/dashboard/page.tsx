'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Plus, UserPlus, Book, Users, Bell, UserCog, ArrowRight, Info, LogOut, FileText } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import { OnboardingDialog } from '@/components/OnboardingDialog'
import ReactConfetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { motion, AnimatePresence } from 'framer-motion' // npm install framer-motion
import { ClassInvitationCard } from '@/components/ClassInvitationCard'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { NotificationDropdown } from '@/components/NotificationDropdown'


interface Classroom {
  id: number
  name: string
  code: string
  year: string
  division: string
  courseCode: string
  courseName: string
  pendingAssignments: number
  creator?: {
    firstName: string
    lastName: string
  }
}

interface UserDetails {
  rollNo: string | null
  srn: string | null
  prn: string | null
  year: string | null
  division: string | null
}

interface ClassInvitation {
  id: string
  courseName: string
  courseCode: string
  year: string
  division: string
  professor: {
    firstName: string
    lastName: string
  }
  memberCount: number
}

const DashboardPage = () => {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [year, setYear] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    rollNo: '',
    srn: '',
    prn: '',
    year: '',
    division: ''
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { width, height } = useWindowSize();
  const [isNavigating, setIsNavigating] = useState(false);
  const [classInvitations, setClassInvitations] = useState<ClassInvitation[]>([]);
  const [classroomToLeave, setClassroomToLeave] = useState<number | null>(null);
  const [classroomToDelete, setClassroomToDelete] = useState<number | null>(null);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Update Promise.all to include mock notifications
        const [classroomsResponse, userDetailsResponse, invitationsResponse] = await Promise.all([
          axios.get('/api/classrooms'),
          axios.get('/api/user'),
          axios.get('/api/classrooms/invitations')
        ]);

        // Set classrooms
        setClassrooms(classroomsResponse.data.classrooms || []);

        // Check user details
        const details = userDetailsResponse.data;
        if (details.rollNo === null || details.srn === null || details.prn === null) {
          setShowOnboarding(true);
          setUserDetails(details);
        }

        // Set invitations
        setClassInvitations(invitationsResponse.data.invitations || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Unable to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  useEffect(() => {
    // Prefetch classroom routes
    classrooms.forEach((classroom) => {
      router.prefetch(`/classroom/${classroom.id}`);
    });
  }, [classrooms, router]);

  const handleOnboardingSubmit = async () => {
    try {
      await axios.put('/api/user', userDetails);
      setShowCelebration(true);
      setShowOnboarding(false);
      
      
      // Show celebration for 5 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 3250);
    } catch (error) {
      console.error('Error updating user details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile details.",
      });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
  
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-600 dark:text-gray-300">
          Please sign in to access the dashboard.
        </div>
      </div>
    );
  }

  // Add this before the loading check
  if (showOnboarding) {
    return (
      <OnboardingDialog
        showOnboarding={showOnboarding}
        setShowOnboarding={setShowOnboarding}
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        onSubmit={handleOnboardingSubmit}
        user={{
          firstName: user?.firstName || '',
          lastName: user?.lastName || ''
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <main>
          <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              {/* Header Section */}
              <div className="flex justify-between items-center mb-8">
                <Skeleton className="h-12 w-64" /> {/* Greeting */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-md" /> {/* Profile button */}
                  <Skeleton className="h-10 w-10 rounded-md" /> {/* Notifications button */}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mb-6">
                <Skeleton className="h-10 w-36" /> {/* Create Classroom button */}
                <Skeleton className="h-10 w-36" /> {/* Join Classroom button */}
              </div>

              {/* Class Invitations Section */}
              <div className="mb-6">
                <Skeleton className="h-8 w-48 mb-3" /> {/* Section title */}
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-white">
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Classrooms Section Header */}
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" /> {/* Section title */}
                <Skeleton className="h-10 w-64" /> {/* Search input */}
              </div>

              {/* Classrooms Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border rounded-lg p-6 bg-white">
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <div className="flex-1">
                        <Skeleton className="h-7 w-3/4 mb-3" /> {/* Course name */}
                        <div className="flex gap-2 mb-3">
                          <Skeleton className="h-5 w-20" /> {/* Badge */}
                          <Skeleton className="h-5 w-20" /> {/* Badge */}
                          <Skeleton className="h-5 w-20" /> {/* Badge */}
                        </div>
                      </div>
                      <div className="bg-muted/30 p-3.5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-11 w-11 rounded-full" />
                          <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 flex-1" /> {/* Enter button */}
                        <Skeleton className="h-12 w-12" /> {/* Delete button */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  const createClassroom = async () => {
    if (!courseName.trim() || !year || !division.trim() || !courseCode.trim()) {
      setCreateError("All fields are required")
      return
    }
    setCreateError(null)
    setIsCreating(true)
    try {
      const res = await axios.post('/api/classrooms/create', { 
        name: courseName, 
        year, 
        division, 
        courseCode,
        courseName 
      }, {
        headers: { 'Content-Type': 'application/json' },
      })
      
      const classroom = res.data
      
      toast({
        variant: "default",
        title: "Success",
        description: `Classroom "${classroom.courseName}" created successfully`,
      })
      
      setClassrooms([...classrooms, classroom])
      setCourseName('')
      setYear('')
      setDivision('')
      setCourseCode('')
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create classroom",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const joinClassroom = async () => {
    if (!joinCode.trim()) {
      setJoinError("Join code cannot be empty")
      return
    }
    setJoinError(null)
    setIsJoining(true)
    try {
      const res = await axios.post('/api/classrooms/join', { code: joinCode }, {
        headers: { 'Content-Type': 'application/json' },
      })
      
      const { message, classroom } = res.data
      
      if (classroom && classroom.courseName) {
        if (message === 'You are already a member of this classroom') {
          toast({
            variant: "default",
            title: "Info",
            description: message,
          })
        } else {
          toast({
            variant: "default",
            title: "Success",
            description: `Joined classroom "${classroom.courseName}" successfully`,
          })
          
          // Fetch updated classroom list
          const updatedClassrooms = await fetchClassrooms()
          setClassrooms(updatedClassrooms)
        }
        
        setJoinCode('')
        setIsJoinDialogOpen(false)
      } else {
        throw new Error('Invalid classroom data received')
      }
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join classroom",
      })
    } finally {
      setIsJoining(false)
    }
  }

  // Add this function to fetch classrooms
  const fetchClassrooms = async () => {
    try {
      const response = await axios.get('/api/classrooms', {
        params: {
          includeCounts: true 
        }
      })
      return response.data.classrooms
    } catch (error) {
      console.error('Failed to fetch classrooms:', error)
      return []
    }
  }

  const handleDeleteClassroom = async () => {
    if (!classroomToDelete) return;
    
    try {
      await axios.delete(`/api/classrooms/${classroomToDelete}`);
      setClassrooms(classrooms.filter(classroom => classroom.id !== classroomToDelete));
      toast({
        variant: "default",
        title: "Success",
        description: "Classroom deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete classroom",
      });
    } finally {
      setClassroomToDelete(null);
      setShowFinalDeleteConfirm(false);
      setDeleteConfirmText('');  // Clear the confirmation text
    }
  };

  const filteredClassrooms = classrooms.filter(classroom =>
    (classroom.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (classroom.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (classroom.division?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleClassroomNavigation = (classroomId: number) => {
    setIsNavigating(true);
    router.push(`/classroom/${classroomId}`);
  };

  const handleAcceptInvitation = async (id: string) => {
    try {
      setIsJoining(true);
      const response = await axios.post('/api/classrooms/join', { id });
      
      // Remove the invitation from the list
      setClassInvitations(prev => prev.filter(invite => invite.id !== id));
      
      // Add the new classroom to the list
      const updatedClassrooms = await fetchClassrooms();
      setClassrooms(updatedClassrooms);

      toast({
        title: "Success",
        description: "Successfully joined the classroom",
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join classroom",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleDismissInvitation = (id: string | number) => {
    // Simply remove from local state
    setClassInvitations(prev => prev.filter(invite => invite.id !== id));
    toast({
      title: "Success",
      description: "Invitation dismissed",
    });
  };

  const handleLeaveClassroom = async (classroomId: number) => {
    try {
      await axios.post(`/api/classrooms/${classroomId}/leave`);
      
      // Remove the classroom from the list
      setClassrooms(prev => prev.filter(c => c.id !== classroomId));
      
      toast({
        title: "Success",
        description: "Successfully left the classroom",
      });
    } catch (error: any) {
      console.error('Error leaving classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.error || "Failed to leave classroom",
      });
    }
  };

  return (
    <>
      <AnimatePresence>
        {showCelebration && (
          <>
            <ReactConfetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.2}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-xl text-center">
                <motion.h1 
                  className="text-4xl font-bold mb-4"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  Welcome to Athenium! 🎓
                </motion.h1>
                <motion.div 
                  className="flex justify-center space-x-4 mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {["", "📚", "✨", "🚀", "🎓"].map((emoji, i) => (
                    <motion.span
                      key={i}
                      className="text-3xl"
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.1
                      }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="py-8">
          <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section - Redesigned */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
              <div>
                <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
                  {(() => {
                    const hour = new Date().getHours()
                    if (hour >= 5 && hour < 12) return "Good Morning"
                    if (hour >= 12 && hour < 18) return "Good Afternoon"
                    return "Good Evening"
                  })()},
                  <span className="font-semibold ml-1">{user?.firstName}</span>
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setShowOnboarding(true)}
                        className="h-9 w-9"
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Update Profile</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <NotificationDropdown userId={user?.id} />
              </div>
            </div>

            {/* Action Bar - Redesigned */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search classrooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-[300px] h-9"
                />
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Join
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join Classroom</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input
                        type="text"
                        value={joinCode}
                        onChange={(e) => {
                          setJoinCode(e.target.value)
                          setJoinError(null)
                        }}
                        placeholder="Classroom Code"
                      />
                      {joinError && (
                        <Alert variant="destructive">
                          <AlertDescription>{joinError}</AlertDescription>
                        </Alert>
                      )}
                      <Button 
                        onClick={joinClassroom} 
                        className="w-full"
                        disabled={isJoining}
                      >
                        {isJoining ? 'Joining...' : 'Join Classroom'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-9">
                      <Plus className="mr-2 h-4 w-4" />
                      Create
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Classroom</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Select onValueChange={setYear} value={year}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="First Year">First Year</SelectItem>
                          <SelectItem value="Second Year">Second Year</SelectItem>
                          <SelectItem value="Third Year">Third Year</SelectItem>
                          <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select onValueChange={setDivision} value={division}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Division" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                            <SelectItem key={letter} value={letter}>
                              {letter}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="text"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        placeholder="Course Code"
                      />
                      <Input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="Course Name"
                      />
                      {createError && (
                        <Alert variant="destructive">
                          <AlertDescription>{createError}</AlertDescription>
                        </Alert>
                      )}
                      <Button 
                        onClick={createClassroom} 
                        className="w-full"
                        disabled={isCreating}
                      >
                        {isCreating ? 'Creating...' : 'Create Classroom'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Class Invitations Section - Redesigned */}
            {classInvitations.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Pending Invitations
                  </h2>
                  <Badge variant="secondary" className="rounded-full">
                    {classInvitations.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {classInvitations.map((invitation) => (
                    <ClassInvitationCard
                      key={invitation.id}
                      {...invitation}
                      onAccept={handleAcceptInvitation}
                      onDismiss={handleDismissInvitation}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Classrooms Section - Redesigned */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Your Classrooms
                </h2>
                <Badge variant="secondary" className="rounded-full">
                  {filteredClassrooms.length}
                </Badge>
              </div>
              
              {filteredClassrooms.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                  <Book className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    No classrooms found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create or join a classroom to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredClassrooms.map((classroom) => (
                    <Card 
                      key={classroom.id} 
                      className="group hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800"
                    >
                      <div className="relative p-4">
                        {/* Top Section */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">
                                {classroom.courseCode}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                              {classroom.courseName}
                            </h3>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              {classroom.year}
                            </Badge>
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              Div {classroom.division}
                            </Badge>
                          </div>
                        </div>

                        {/* Professor & Assignment Info */}
                        <div className="flex items-center justify-between mb-3 p-2.5 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCog className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Professor</p>
                              <p className="text-sm font-medium truncate">
                                {classroom.creator?.firstName} {classroom.creator?.lastName}
                              </p>
                            </div>
                          </div>
                          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            classroom.pendingAssignments > 0 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {classroom.pendingAssignments} Due
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="default" 
                            onClick={() => handleClassroomNavigation(classroom.id)}
                            className="flex-1 h-9 text-sm bg-primary hover:bg-primary/90"
                            disabled={isNavigating}
                          >
                            {isNavigating ? (
                              <span className="flex items-center justify-center gap-1.5">
                                <span className="animate-spin">⏳</span>
                                Loading...
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-1.5">
                                Enter
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                              </span>
                            )}
                          </Button>
                          <TooltipProvider delayDuration={0}>
                            <div className="flex gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setClassroomToLeave(classroom.id)}
                                    className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <LogOut className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Leave Classroom</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setClassroomToDelete(classroom.id)}
                                    className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Delete Classroom</TooltipContent>
                              </Tooltip>
                            </div>
                          </TooltipProvider>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={classroomToLeave !== null} onOpenChange={() => setClassroomToLeave(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Classroom</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to leave this classroom? You'll need a new invitation to rejoin.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setClassroomToLeave(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (classroomToLeave) {
                  handleLeaveClassroom(classroomToLeave);
                  setClassroomToLeave(null);
                }
              }}
            >
              Leave Classroom
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={classroomToDelete !== null} onOpenChange={() => setClassroomToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Classroom</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-200 rounded-lg">
              <Info className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">This action will permanently delete the classroom and all its data.</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this classroom? This will remove all assignments, submissions, and student data.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setClassroomToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowFinalDeleteConfirm(true)}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFinalDeleteConfirm} onOpenChange={setShowFinalDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Are you absolutely sure?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-semibold">
              This action cannot be undone. This will permanently delete the classroom and all associated data.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-950/50 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                Please type <span className="font-mono font-bold">
                  {classrooms.find(c => c.id === classroomToDelete)?.courseName}
                </span> to confirm.
              </p>
              <Input 
                className="mt-2"
                placeholder="Type the course name to confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => {
              setShowFinalDeleteConfirm(false);
              setClassroomToDelete(null);
              setDeleteConfirmText('');  // Clear the input when canceling
            }}>
              Cancel
            </Button>
            <Button 
              id="final-delete-button"
              variant="destructive" 
              onClick={handleDeleteClassroom}
              disabled={deleteConfirmText.toLowerCase() !== (classrooms.find(c => c.id === classroomToDelete)?.courseName || '').toLowerCase()}
            >
              Delete Classroom
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DashboardPage
