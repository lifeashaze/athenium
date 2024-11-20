import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface User {
  id: string
  firstName: string
  email: string
  role: "STUDENT" | "PROFESSOR" | "ADMIN"
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