'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { motion, AnimatePresence } from 'framer-motion'
import { ClassInvitationCard } from '@/components/ClassInvitationCard'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { Clock, GraduationCap, CheckCircle2 } from 'lucide-react'
import { ModeToggle } from "@/components/ThemeToggle"
import { useClassrooms } from '@/lib/hooks/useClassrooms'
import { useInvitations } from '@/lib/hooks/useInvitations'
import { useActivities } from '@/lib/hooks/useActivites'
import { useDbUser } from '@/lib/hooks/useUser'


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

interface Activity {
  id: string
  type: 'attendance' | 'submission' | 'grade'
  title: string
  date: Date
  details: {
    grade?: number
    maxGrade?: number
    classroomName?: string
    status?: 'present' | 'absent'
    submissionStatus?: 'on_time' | 'late'
  }
}

interface NavigationState {
  [key: number]: boolean;
}

const yearAbbreviations: { [key: string]: string } = {
  'First Year': 'FY',
  'Second Year': 'SY',
  'Third Year': 'TY',
  'Fourth Year': 'LY'  // LY for Last Year
};

const getYearDivisionDisplay = (year: string, division: string) => {
  const yearAbbr = yearAbbreviations[year] || year;
  return `${yearAbbr}-${division}`;
};

// Add User interface
interface User {
  id: string;
  firstName: string;
  email: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
}

const DashboardPage = () => {
  const { user, isLoaded } = useUser();
  const { dbUser, isLoading: isDbUserLoading } = useDbUser();
  const { toast } = useToast();
  const router = useRouter();


  const {
    classrooms,
    isLoading: isClassroomsLoading,
    createClassroom,
    joinClassroom,
    leaveClassroom,
    deleteClassroom,
    isCreating,
    isJoining,
    isDeleting,
  } = useClassrooms();

  const {
    invitations,
    isLoading: isInvitationsLoading,
    acceptInvitation,
    dismissInvitation,
    refetchInvitations,
  } = useInvitations();

  const {
    activities,
    isLoading: isActivitiesLoading,
  } = useActivities();

  // Combine all loading states
  const isLoading = !isLoaded || isClassroomsLoading || isInvitationsLoading || isActivitiesLoading || isDbUserLoading || !user;

  // Use the data from queries
  const recentActivities = activities || [];
  const isProfessor = dbUser?.role === 'PROFESSOR';
  const [joinCode, setJoinCode] = useState<string>('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [year, setYear] = useState<string>('');
  const [division, setDivision] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [navigatingStates, setNavigatingStates] = useState<NavigationState>({});

  const [classroomToLeave, setClassroomToLeave] = useState<number | null>(null);
  const [classroomToDelete, setClassroomToDelete] = useState<number | null>(null);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    // Prefetch classroom routes
    classrooms.forEach((classroom) => {
      router.prefetch(`/classroom/${classroom.id}`);
    });
  }, [classrooms, router]);

  // Update the useEffect that checks for new users
  useEffect(() => {
    if (!isLoading && dbUser) {
      // Check if any of the required fields are missing
      const isNewUser = !dbUser.rollNo || !dbUser.year || !dbUser.division;
      if (isNewUser) {
        setShowOnboarding(true);
      }
    }
  }, [isLoading, dbUser]);

  const handleOnboardingSubmit = async () => {
    try {
      await axios.put('/api/user', userDetails);
      
      // Show celebration animation
      setShowCelebration(true);
      setShowOnboarding(false);
      
      // Check for invitations after a short delay (to allow celebration to show)
      setTimeout(async () => {
        try {
          // Refresh invitations data
          await refetchInvitations();
          
          // If there are invitations, show a toast notification
          if (invitations.length > 0) {
            toast({
              title: "Class Invitations Available",
              description: `You have ${invitations.length} pending class invitation${invitations.length > 1 ? 's' : ''}.`,
              action: (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Scroll to invitations section if it exists
                          document.querySelector('#invitations-section')?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'center'
                          });
                        }}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View Invitations</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ),
            });
          }
        } catch (error) {
          console.error('Error fetching invitations:', error);
        }
      }, 1000); // Check after 1 second
      
      // Hide celebration after specified duration
      setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
    } catch (error) {
      console.error('Error updating user details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile details.",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-gray-600 dark:text-gray-300">
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
      <div className="min-h-screen bg-background">
        <main className="py-8">
          <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>

            {/* Action Bar Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-4 bg-card rounded-lg border">
              <Skeleton className="h-9 w-[300px]" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            {/* Recent Activity Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Activity Timeline */}
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="relative">
                      <div className="ml-10">
                        <Card className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <Skeleton className="h-4 w-3/4 mb-2" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </div>
                        </Card>
                      </div>
                      <Skeleton className="absolute left-2.5 top-3 h-3 w-3 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Overview */}
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Classrooms Grid Skeleton */}
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-2" />
                          <Skeleton className="h-6 w-48 mb-1" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>

                      {/* Professor Info */}
                      <div className="p-2.5 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div>
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </div>
                  </Card>
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

  const filteredClassrooms = classrooms.filter(classroom =>
    (classroom.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (classroom.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (classroom.division?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleClassroomNavigation = (classroomId: number) => {
    setNavigatingStates(prev => ({ ...prev, [classroomId]: true }));
    router.push(`/classroom/${classroomId}`);
  };

  const handleCreateClassroom = () => {
    if (!courseName.trim() || !year || !division.trim() || !courseCode.trim()) {
      setCreateError("All fields are required")
      return
    }
    createClassroom({ 
      name: courseName, 
      year, 
      division, 
      courseCode, 
      courseName 
    })
    setIsCreateDialogOpen(false)
  }

  const handleJoinClassroom = () => {
    if (!joinCode.trim()) {
      setJoinError("Join code is required")
      return
    }
    joinClassroom(joinCode)
    setIsJoinDialogOpen(false)
  }

  const handleDeleteClassroom = () => {
    if (!classroomToDelete) return
    
    const classroom = classrooms.find(c => c.id === classroomToDelete)
    if (!classroom) return
    
    if (deleteConfirmText.toLowerCase() !== classroom.courseName.toLowerCase()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Course name doesn't match",
      })
      return
    }
    
    deleteClassroom(classroomToDelete)
    setShowFinalDeleteConfirm(false)
    setClassroomToDelete(null)
    setDeleteConfirmText('')
  }

  return (
    <>
      <AnimatePresence>
        {showCelebration && (
          <>
            <ReactConfetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.15}
              colors={['#FF5733', '#33FF57', '#5733FF', '#FFFF33']}
              tweenDuration={5000}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative p-8 rounded-2xl overflow-hidden"
              >
                {/* Glass background */}
                <div className="absolute inset-0 bg-white/30 dark:bg-gray-950/30 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800/20 shadow-2xl" />
                
                {/* Content */}
                <div className="relative space-y-6 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                      Welcome to Athenium!
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Your learning journey begins here
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center"
                  >
                    <div className="w-24 h-24 relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10"
                      />
                      <motion.div
                        animate={{
                          scale: [1.1, 1.3, 1.1],
                          rotate: [180, 540],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.2
                        }}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/10"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <GraduationCap className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center space-x-8"
                  >
                    {[
                      { icon: Book, label: "Learn" },
                      { icon: Users, label: "Connect" },
                      { icon: CheckCircle2, label: "Achieve" }
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + (i * 0.1) }}
                        className="flex flex-col items-center space-y-2"
                      >
                        <div className="p-3 rounded-full bg-primary/10">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.label}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <div className="min-h-screen bg-background">
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
                <p className="text-xs text-muted-foreground mt-1">
                  Test data inserted for demonstration purposes
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ModeToggle />
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

            {/* Action Bar - Modified for role-based access */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-4 bg-card rounded-lg shadow-sm border">
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
                {!isProfessor && (
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
                          onClick={handleJoinClassroom} 
                          className="w-full"
                          disabled={isJoining}
                        >
                          {isJoining ? 'Joining...' : 'Join Classroom'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                {isProfessor && (
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
                            {Object.keys(yearAbbreviations).map((yearOption) => (
                              <SelectItem key={yearOption} value={yearOption}>
                                {yearOption}
                              </SelectItem>
                            ))}
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
                          onClick={handleCreateClassroom} 
                          className="w-full"
                          disabled={isCreating}
                        >
                          {isCreating ? 'Creating...' : 'Create Classroom'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {/* Class Invitations Section - Redesigned */}
            {invitations.length > 0 && (
              <div id="invitations-section" className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Pending Invitations
                  </h2>
                  <Badge variant="secondary" className="rounded-full">
                    {invitations.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <ClassInvitationCard
                      key={invitation.id}
                      {...invitation}
                      onAccept={acceptInvitation}
                      onDismiss={dismissInvitation}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Classrooms Section - Should come first */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Your Classrooms
                </h2>
                <Badge variant="secondary" className="rounded-full">
                  {filteredClassrooms.length}
                </Badge>
              </div>
              
              {filteredClassrooms.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-lg border">
                  <Book className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
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
                      className="group hover:shadow-md transition-all duration-300 overflow-hidden bg-card"
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
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0 h-5"
                          >
                            {getYearDivisionDisplay(classroom.year, classroom.division)}
                          </Badge>
                        </div>

                        {/* Professor & Assignment Info */}
                        <div className="flex items-center justify-between mb-3 p-2.5 bg-muted/50 rounded-lg">
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
                            disabled={navigatingStates[classroom.id]}
                          >
                            {navigatingStates[classroom.id] ? (
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
                              {!isProfessor && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setClassroomToLeave(classroom.id)}
                                      className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <LogOut className="h-4 w-4 text-red-500 dark:text-red-400" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">Leave Classroom</TooltipContent>
                                </Tooltip>
                              )}
                              {isProfessor && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setClassroomToDelete(classroom.id)}
                                      className="h-9 w-9 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">Delete Classroom</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TooltipProvider>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Section with two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Recent Activity Column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Recent Activity
                  </h2>
                </div>

                {recentActivities.length === 0 ? (
                  <Card className="p-3 text-center">
                    <Clock className="h-8 w-8 mx-auto text-gray-400 mb-1.5" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5">
                      No recent activity
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Your recent classroom activities will appear here
                    </p>
                  </Card>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/50 to-transparent" />
                    
                    <div className="space-y-2">
                      {recentActivities
                        .slice(0, 5)
                        .map((activity, index) => (
                        <div key={activity.id} className="relative">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="ml-10 relative"
                          >
                            <Card className="overflow-hidden">
                              <div className={`absolute top-0 left-0 w-full h-0.5 ${
                                activity.type === 'attendance' 
                                  ? 'bg-blue-500' 
                                  : activity.type === 'submission'
                                  ? 'bg-purple-500'
                                  : 'bg-green-500'
                              }`} />
                              
                              <div className="p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-0.5">
                                        {activity.title}
                                      </p>
                                      {activity.details.classroomName && (
                                        <p className="text-xs text-muted-foreground truncate">
                                          {activity.details.classroomName}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {activity.type === 'grade' && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                          {activity.details.grade}/{activity.details.maxGrade}
                                        </Badge>
                                      )}
                                      {activity.type === 'submission' && (
                                        <Badge 
                                          variant={activity.details.submissionStatus === 'on_time' ? 'secondary' : 'destructive'} 
                                          className="text-[10px] px-1.5 py-0.5"
                                        >
                                          {activity.details.submissionStatus === 'on_time' ? 'On Time' : 'Late'}
                                        </Badge>
                                      )}
                                      {activity.type === 'attendance' && (
                                        <Badge 
                                          variant={activity.details.status === 'present' ? 'secondary' : 'destructive'} 
                                          className="text-[10px] px-1.5 py-0.5"
                                        >
                                          {activity.details.status === 'present' ? 'Present' : 'Absent'}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </motion.div>

                          <div className="absolute left-2.5 top-3">
                            <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                              activity.type === 'attendance' 
                                ? 'bg-blue-500' 
                                : activity.type === 'submission'
                                ? 'bg-purple-500'
                                : 'bg-green-500'
                            }`}>
                              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Activity Overview Column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Activity Overview
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Classrooms Card */}
                  <Card className="p-4 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-lg">
                        <Book className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Active Classes
                        </p>
                        <p className="text-2xl font-semibold mt-1">
                          {classrooms.length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Submissions Card */}
                  <Card className="p-4 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Submissions
                        </p>
                        <p className="text-2xl font-semibold mt-1">
                          {recentActivities.filter(a => a.type === 'submission').length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Grades Card */}
                  <Card className="p-4 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2.5 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-green-500 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Grades
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-semibold mt-1">
                            {recentActivities.filter(a => a.type === 'grade').length}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(recentActivities
                              .filter(a => a.type === 'grade')
                              .reduce((acc, curr) => acc + (curr.details.grade! / curr.details.maxGrade!) * 100, 0) / 
                              recentActivities.filter(a => a.type === 'grade').length || 0
                            )}% avg
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Attendance Card */}
                  <Card className="p-4 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg">
                        <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Attendance
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-semibold mt-1">
                            {recentActivities.filter(a => a.type === 'attendance').length}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(recentActivities
                              .filter(a => a.type === 'attendance')
                              .filter(a => a.details.status === 'present').length / 
                              recentActivities.filter(a => a.type === 'attendance').length * 100 || 0
                            )}% present
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Pending Assignments Card */}
                  <Card className="p-4 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-lg">
                        <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Pending Work
                        </p>
                        <p className="text-2xl font-semibold mt-1">
                          {classrooms.reduce((acc, curr) => acc + (curr.pendingAssignments || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Class Invitations Card */}
                  <Card className="p-4 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="bg-rose-100 dark:bg-rose-900/30 p-2.5 rounded-lg">
                        <UserPlus className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Invitations
                        </p>
                        <p className="text-2xl font-semibold mt-1">
                          {invitations.length}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={classroomToLeave !== null} onOpenChange={() => setClassroomToLeave(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Classroom</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to leave this classroom? You&apos;ll need a new invitation to rejoin.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setClassroomToLeave(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (classroomToLeave) {
                  leaveClassroom(classroomToLeave);
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
        <DialogContent className="bg-background border">
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
        <DialogContent className="bg-background border">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Are you absolutely sure?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-semibold">
              This action cannot be undone. This will permanently delete the classroom and all associated data.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
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