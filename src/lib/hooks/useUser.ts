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
    },
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status

        if (status === 404) {
          return failureCount < 2
        }

        if (status === 401 || status === 403) {
          return false
        }
      }

      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 1500),
  })

  return {
    dbUser: userQuery.data,
    isLoading: userQuery.isLoading,
    isFetching: userQuery.isFetching,
    isMissingUser: axios.isAxiosError(userQuery.error) && userQuery.error.response?.status === 404,
    refetch: userQuery.refetch,
  }
}
