import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface User {
  id: string
  role: "STUDENT" | "PROFESSOR" | "ADMIN"
  rollNo?: string | null
  year?: string | null
  division?: string | null
  srn?: string | null
  prn?: string | null
  officeHours?: string | null
}

export function useDbUser() {
  const userQuery = useQuery({
    queryKey: ['dbUser'],
    queryFn: async () => {
      const response = await axios.get('/api/user')
      return response.data as User
    }
  })

  return {
    dbUser: userQuery.data,
    isLoading: userQuery.isLoading,
  }
}