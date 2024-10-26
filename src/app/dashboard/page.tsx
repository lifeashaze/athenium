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
import { Trash2, Plus, UserPlus, Book, Users, Bell, UserCog } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OnboardingDialog } from '@/components/OnboardingDialog'
import ReactConfetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { motion, AnimatePresence } from 'framer-motion' // npm install framer-motion

interface Classroom {
  id: number
  name: string
  code: string
  year: string
  division: string
  courseCode: string
  courseName: string
}

interface Notification {
  id: number
  message: string
  type: 'ASSIGNMENT' | 'ATTENDANCE' | 'MEMBERSHIP' | 'RESOURCE' | 'GENERAL'
  createdAt: string
  read: boolean
}

// Add interface for user details
interface UserDetails {
  rollNo: string | null
  srn: string | null
  prn: string | null
  year: string | null
  division: string | null
}

const DashboardPage = () => {
  const { user } = useUser();
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
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

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [classroomsResponse, notificationsResponse, userDetailsResponse] = await Promise.all([
          axios.get('/api/classrooms'),
          axios.get('/api/notifications'),
          axios.get('/api/user')
        ]);

        // Set classrooms
        setClassrooms(classroomsResponse.data.classrooms || []);

        // Set notifications
        setNotifications(notificationsResponse.data.notifications || []);
        setUnreadCount(notificationsResponse.data.notifications.filter((n: Notification) => !n.read).length);

        // Check user details
        const details = userDetailsResponse.data;
        if (details.rollNo === null || details.srn === null || details.prn === null) {
          setShowOnboarding(true);
          setUserDetails(details);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Unable to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

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

  if (!user) {
    return <div>Please sign in to access the dashboard.</div>;
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
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <Skeleton className="h-12 w-3/4 mx-auto mb-8" />
              <div className="flex justify-end space-x-4 mb-6">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
              </div>
              <Skeleton className="h-8 w-64 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-10 w-10" />
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
      const response = await axios.get('/api/classrooms')
      return response.data.classrooms
    } catch (error) {
      console.error('Failed to fetch classrooms:', error)
      return []
    }
  }

  const deleteClassroom = async (classroomId: number) => {
    try {
      await axios.delete(`/api/classrooms/${classroomId}`)
      setClassrooms(classrooms.filter(classroom => classroom.id !== classroomId))
      toast({
        variant: "default",
        title: "Success",
        description: "Classroom deleted successfully",
      })
    } catch (error) {
      console.error('Failed to delete classroom:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete classroom",
      })
    }
  }

  const filteredClassrooms = classrooms.filter(classroom =>
    (classroom.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (classroom.courseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (classroom.division?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const markAsRead = async (notificationId: number) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`)
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => prev - 1)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
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
                  {["🎉", "📚", "✨", "🚀", "🎓"].map((emoji, i) => (
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
      <div className="min-h-screen bg-gray-100">
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  {(() => {
                    const hour = new Date().getHours()
                    if (hour >= 5 && hour < 12) return "Good Morning"
                    if (hour >= 12 && hour < 18) return "Good Afternoon"
                    if ((hour >= 18 && hour < 23)) return "Good Evening"
                    return "Happy Late Night "
                  })()}, {user?.firstName}
                </h1>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setShowOnboarding(true)}
                    title="Update Profile Details"
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="relative">
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                          <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      {notifications.length === 0 ? (
                        <DropdownMenuItem>No notifications</DropdownMenuItem>
                      ) : (
                        notifications.map((notification) => (
                          <DropdownMenuItem 
                            key={notification.id} 
                            className="flex flex-col items-start"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <span className={`text-sm ${notification.read ? 'text-gray-500' : 'font-semibold'}`}>
                              {notification.message}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mb-6">
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" /> Create Classroom</Button>
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
                      <Input
                        type="text"
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        placeholder="Division"
                      />
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
                <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> Join Classroom</Button>
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
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Classrooms</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search classrooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64"
                  />
                </div>
              </div>
              
              {filteredClassrooms.length === 0 ? (
                <p>No classrooms found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClassrooms.map((classroom) => (
                    <Card key={classroom.id} className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-semibold">{classroom.courseName}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {classroom.year}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 flex items-center">
                            <Book className="inline mr-2 h-4 w-4" />{classroom.courseCode}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Users className="inline mr-2 h-4 w-4" />{classroom.division}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <span className="font-medium mr-1">Code:</span> {classroom.code}
                          </p>
                        </div>
                      </CardContent>
                      <div className="px-6 pb-4">
                        <div className="flex justify-between items-center">
                          <Button 
                            variant="outline" 
                            onClick={() => router.push(`/classroom/${classroom.id}`)}
                            className="w-full mr-2"
                          >
                            View
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteClassroom(classroom.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </>
  )
}

export default DashboardPage
