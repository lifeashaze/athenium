'use client'

import { useUser } from '@clerk/nextjs'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { ClipLoader } from 'react-spinners'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Plus, UserPlus, Book, Users, CheckCircle2, Timer, StickyNote } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

interface Classroom {
  id: number
  name: string
  code: string
  year: string
  division: string
  courseCode: string
  courseName: string
}

interface TodoItem {
  id: number
  text: string
  completed: boolean
}

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [joinCode, setJoinCode] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [year, setYear] = useState<string>('')
  const [division, setDivision] = useState<string>('')
  const [courseCode, setCourseCode] = useState<string>('')
  const [courseName, setCourseName] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)

  // New state variables for productivity features
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [timerActive, setTimerActive] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [quickNote, setQuickNote] = useState('')

  const fetchClassrooms = useCallback(async () => {
    try {
      const response = await axios.get('/api/classrooms')
      setClassrooms(response.data)
    } catch (error) {
      console.error('Failed to fetch classrooms:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classrooms",
      })
    } finally {
      setIsPageLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchClassrooms()
    } else if (isLoaded) {
      setIsPageLoading(false)
    }
  }, [isLoaded, isSignedIn, fetchClassrooms])

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
      
      const classroom = res.data
      
      toast({
        variant: "default",
        title: "Success",
        description: `Joined classroom "${classroom.name}" successfully`,
      })
      
      setJoinCode('')
      setIsJoinDialogOpen(false)
      fetchClassrooms()
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

  // New functions for todo list, timer, and quick notes
  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }])
      setNewTodo('')
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive])

  const toggleTimer = () => {
    setTimerActive(!timerActive)
  }

  const resetTimer = () => {
    setTimerActive(false)
    setTimerSeconds(0)
  }

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={true} />
      </div>
    )
  }

  if (!isSignedIn) {
    return <p className="text-center text-xl mt-10">You need to be logged in</p>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
              {(() => {
                const hour = new Date().getHours()
                if (hour >= 5 && hour < 12) return "Good Morning"
                if (hour >= 12 && hour < 18) return "Good Afternoon"
                if (hour >= 18 && hour < 22) return "Good Evening"
                return "Good Night"
              })()}, {user?.firstName}
            </h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Todo List Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="mr-2" />
                    Todo List
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-4">
                    <Input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Add a new todo"
                      className="mr-2"
                    />
                    <Button onClick={addTodo}>Add</Button>
                  </div>
                  <ul className="space-y-2">
                    {todos.map(todo => (
                      <li key={todo.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => toggleTodo(todo.id)}
                            className="mr-2"
                          />
                          <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                            {todo.text}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteTodo(todo.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              {/* Study Timer Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Timer className="mr-2" />
                    Study Timer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-center mb-4">
                    {formatTime(timerSeconds)}
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button onClick={toggleTimer}>
                      {timerActive ? 'Pause' : 'Start'}
                    </Button>
                    <Button variant="outline" onClick={resetTimer}>Reset</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Quick Notes Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <StickyNote className="mr-2" />
                  Quick Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  placeholder="Jot down your thoughts or important points..."
                  rows={4}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Your Classrooms</CardTitle>
              </CardHeader>
              <CardContent>
                {classrooms.length === 0 ? (
                  <p>You haven&apos;t created or joined any classrooms yet.</p>
                ) : (
                  <Tabs defaultValue="grid" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="grid">Grid View</TabsTrigger>
                      <TabsTrigger value="list">List View</TabsTrigger>
                    </TabsList>
                    <TabsContent value="grid">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classrooms.map((classroom) => (
                          <Card key={classroom.id} className="flex flex-col justify-between">
                            <CardHeader>
                              <CardTitle>{classroom.courseName}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p><Book className="inline mr-2" />{classroom.courseCode}</p>
                              <p><Users className="inline mr-2" />{classroom.year} - {classroom.division}</p>
                              <p className="text-sm text-gray-500 mt-2">Code: {classroom.code}</p>
                            </CardContent>
                            <div className="p-4 mt-auto">
                              <div className="flex justify-between">
                                <Button onClick={() => router.push(`/classroom/${classroom.id}`)}>
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
                    </TabsContent>
                    <TabsContent value="list">
                      <ul className="space-y-4">
                        {classrooms.map((classroom) => (
                          <li key={classroom.id} className="flex justify-between items-center border-b pb-4">
                            <div>
                              <h3 className="font-semibold">{classroom.courseName}</h3>
                              <p className="text-sm text-gray-500">{classroom.courseCode} | {classroom.year} - {classroom.division}</p>
                              <p className="text-xs text-gray-400">Code: {classroom.code}</p>
                            </div>
                            <div className="space-x-2">
                              <Button onClick={() => router.push(`/classroom/${classroom.id}`)}>
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
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}