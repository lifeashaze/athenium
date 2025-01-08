import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useToast } from "@/components/ui/use-toast"

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

interface CreateClassroomData {
  name: string
  year: string
  division: string
  courseCode: string
  courseName: string
}

export function useClassrooms() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const classroomsQuery = useQuery({
    queryKey: ['classrooms'],
    queryFn: async () => {
      const response = await axios.get('/api/classrooms')
      return response.data.classrooms as Classroom[]
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateClassroomData) => {
      const response = await axios.post('/api/classrooms/create', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast({
        title: "Success",
        description: "Classroom created successfully",
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create classroom",
      })
    }
  })

  const joinMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await axios.post('/api/classrooms/join', { code })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast({
        title: "Success",
        description: "Successfully joined classroom",
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join classroom",
      })
    }
  })

  const leaveMutation = useMutation({
    mutationFn: async (classroomId: number) => {
      await axios.post(`/api/classrooms/${classroomId}/leave`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast({
        title: "Success",
        description: "Successfully left the classroom",
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to leave classroom",
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (classroomId: number) => {
      await axios.delete(`/api/classrooms/${classroomId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast({
        title: "Success",
        description: "Classroom deleted successfully",
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete classroom",
      })
    }
  })

  return {
    classrooms: classroomsQuery.data ?? [],
    isLoading: classroomsQuery.isLoading,
    createClassroom: createMutation.mutate,
    joinClassroom: joinMutation.mutate,
    leaveClassroom: leaveMutation.mutate,
    deleteClassroom: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isJoining: joinMutation.isPending,
    isLeaving: leaveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}