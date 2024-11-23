import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useToast } from "@/components/ui/use-toast"

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

export function useInvitations() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const invitationsQuery = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const response = await axios.get('/api/classrooms/invitations')
      return response.data.invitations as ClassInvitation[]
    }
  })

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.post('/api/classrooms/join', { id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
      toast({
        title: "Success",
        description: "Successfully joined the classroom",
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

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['invitations'], (oldData: ClassInvitation[] | undefined) => {
        return oldData ? oldData.filter(invitation => invitation.id !== id) : [];
      });
      
      toast({
        title: "Success",
        description: "Invitation dismissed",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to dismiss invitation",
      });
    }
  })

  return {
    invitations: invitationsQuery.data ?? [],
    isLoading: invitationsQuery.isLoading,
    acceptInvitation: acceptMutation.mutate,
    dismissInvitation: dismissMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isDismissing: dismissMutation.isPending,
    refetchInvitations: invitationsQuery.refetch,
  }
}