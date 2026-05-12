import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface Classroom {
  id: number
  name: string
  code: string
  inviteLink: string
  year: string
  division: string
  creatorFirstName: string
  creatorLastName: string
  creatorEmail: string
  courseCode: string
  courseName: string
}

export interface Assignment {
  id: number
  title: string
  type: 'theory' | 'lab'
  deadline: string
  maxMarks: number
  description?: string
  requirements?: string[]
  creator: {
    firstName: string
  }
  submissions?: {
    id: string
    submittedAt: string
    marks: number
  }[]
}

export interface Submission {
  id: string
  submittedAt: Date | string
  content: string
  userId: string
  assignmentId: string
  marks: number
  assignment: {
    id: string
    title: string
    maxMarks: number
  }
}

export function useClassroom(classroomId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['classroom', classroomId],
    enabled: enabled && !!classroomId,
    queryFn: async () => {
      const response = await axios.get(`/api/classrooms/${classroomId}`)
      return response.data.classroom as Classroom
    },
  })
}

export function useClassroomAssignments(classroomId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['classroom', classroomId, 'assignments'],
    enabled: enabled && !!classroomId,
    queryFn: async () => {
      const response = await axios.get(`/api/classrooms/${classroomId}/assignments`, {
        params: { includeSubmissions: true },
      })
      return response.data as Assignment[]
    },
  })
}

export function useClassroomSubmissions(classroomId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['classroom', classroomId, 'submissions'],
    enabled: enabled && !!classroomId,
    queryFn: async () => {
      const response = await axios.get(`/api/classrooms/${classroomId}/submissions`)
      return response.data as Submission[]
    },
  })
}
