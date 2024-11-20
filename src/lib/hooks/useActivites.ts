import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

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

export function useActivities() {
  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const response = await axios.get('/api/activities')
      return response.data.activities as Activity[]
    }
  })

  return {
    activities: activitiesQuery.data ?? [],
    isLoading: activitiesQuery.isLoading,
  }
}