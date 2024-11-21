'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { Badge } from "@/components/ui/badge"
import { Search } from 'lucide-react'

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'STUDENT' | 'PROFESSOR' | 'ADMIN'
  rollNo?: string
  year?: string
  division?: string
  srn?: string
  prn?: string
  officeHours?: string
  memberships?: {
    classroomId: string
    classroom: {
      name: string
      courseCode: string
      courseName: string
    }
  }[]
}

function UserSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-6 w-full max-w-[150px]" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-full max-w-[200px]" /></TableCell>
      <TableCell><Skeleton className="h-6 w-full max-w-[100px]" /></TableCell>
      <TableCell className="hidden lg:table-cell"><Skeleton className="h-12 w-full max-w-[200px]" /></TableCell>
      <TableCell><Skeleton className="h-10 w-full max-w-[150px]" /></TableCell>
    </TableRow>
  )
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [changedValues, setChangedValues] = useState<Partial<User>>({})
  const { getToken } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'ALL' | 'STUDENT' | 'PROFESSOR' | 'ADMIN'>('ALL')
  const itemsPerPage = 10
  const [searchTerm, setSearchTerm] = useState('')

  const fetchUsers = async () => {
    try {
      const token = await getToken()
      const response = await fetch('/api/members', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      toast.error('Error fetching users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInputChange = (field: keyof User, value: string) => {
    if (!editingUser) return

    if (editingUser[field] !== value) {
      setChangedValues(prev => ({
        ...prev,
        [field]: value
      }))
    } else {
      const newChangedValues = { ...changedValues }
      delete newChangedValues[field]
      setChangedValues(newChangedValues)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser || Object.keys(changedValues).length === 0) return

    setIsUpdating(true)
    try {
      const token = await getToken()
      const response = await fetch('/api/members', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingUser.id,
          ...changedValues
        })
      })

      if (!response.ok) throw new Error('Failed to update user')
      
      const { user: updatedUser } = await response.json()
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        )
      )
      setEditingUser(updatedUser)
      setChangedValues({})
      
      toast.success('User updated successfully')
    } catch (error) {
      toast.error('Error updating user')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCloseDialog = () => {
    setEditingUser(null)
    setChangedValues({})
    setIsCreateDialogOpen(false)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    setIsDeleting(userId)
    try {
      const token = await getToken()
      const response = await fetch(`/api/members?id=${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to delete user')
      
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      toast.error('Error deleting user')
      console.error(error)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleRemoveFromClass = async (classroomId: string) => {
    if (!editingUser) return
    if (!confirm('Are you sure you want to remove this class membership?')) return

    setIsUpdating(true)
    try {
      const token = await getToken()
      const response = await fetch('/api/members', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: editingUser.id,
          classroomId,
          action: 'removeMembership'
        })
      })

      if (!response.ok) throw new Error('Failed to remove class membership')
      
      const { user: updatedUser } = await response.json()
      
      // Update both the editing user and the users list
      setEditingUser(updatedUser)
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        )
      )
      
      toast.success('Class membership removed successfully')
    } catch (error) {
      toast.error('Error removing class membership')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const paginatedUsers = () => {
    const filteredUsers = users.filter(user => {
      const roleMatch = activeTab === 'ALL' ? true : user.role === activeTab;
      
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = searchTerm === '' || 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.srn && user.srn.toLowerCase().includes(searchLower)) ||
        (user.rollNo && user.rollNo.toLowerCase().includes(searchLower));
      
      return roleMatch && searchMatch;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      users: filteredUsers.slice(startIndex, endIndex),
      totalPages: Math.ceil(filteredUsers.length / itemsPerPage),
      totalUsers: filteredUsers.length
    };
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-8 w-[200px] mb-6" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden lg:table-cell">Details</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <UserSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="py-8">
        <div className="container max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Combined Header Section with Search */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Admin Panel</CardTitle>
                  <CardDescription>Manage all users and their permissions</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 w-full sm:w-[300px] h-9"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as typeof activeTab)
            setCurrentPage(1)
          }}>
            <TabsList className="mb-4">
              <TabsTrigger value="ALL">All Users</TabsTrigger>
              <TabsTrigger value="STUDENT">Students</TabsTrigger>
              <TabsTrigger value="PROFESSOR">Professors</TabsTrigger>
              <TabsTrigger value="ADMIN">Admins</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Users Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Details</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers().users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={async (newRole) => {
                          try {
                            const token = await getToken()
                            const response = await fetch('/api/members', {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                id: user.id,
                                role: newRole
                              })
                            })

                            if (!response.ok) throw new Error('Failed to update role')
                            
                            const { user: updatedUser } = await response.json()
                            setUsers(prevUsers => 
                              prevUsers.map(u => 
                                u.id === updatedUser.id ? updatedUser : u
                              )
                            )
                            
                            toast.success('Role updated successfully')
                          } catch (error) {
                            toast.error('Error updating role')
                            console.error(error)
                          }
                        }}
                      >
                        <SelectTrigger className="w-[120px] md:w-[180px]">
                          <SelectValue>
                            <span className={cn(
                              "text-sm font-medium",
                              user.role === 'ADMIN' && "text-red-600 dark:text-red-400",
                              user.role === 'PROFESSOR' && "text-blue-600 dark:text-blue-400",
                              user.role === 'STUDENT' && "text-green-600 dark:text-green-400"
                            )}>
                              {user.role}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STUDENT">
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              STUDENT
                            </span>
                          </SelectItem>
                          <SelectItem value="PROFESSOR">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              PROFESSOR
                            </span>
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">
                              ADMIN
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {user.role === 'STUDENT' && (
                        <div className="space-y-1">
                          <Badge variant="outline" className="mr-2">SRN: {user.srn}</Badge>
                          <Badge variant="outline" className="mr-2">Roll: {user.rollNo}</Badge>
                          <Badge variant="outline">Year: {user.year}</Badge>
                        </div>
                      )}
                      {user.role === 'PROFESSOR' && (
                        <Badge variant="outline">Office Hours: {user.officeHours}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setEditingUser(user)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent 
                          className="w-[95vw] max-w-[90rem] max-h-[95vh] overflow-y-auto"
                          onPointerDownOutside={handleCloseDialog}
                          onEscapeKeyDown={handleCloseDialog}
                        >
                          <DialogHeader>
                            <DialogTitle>Edit User: {user.firstName} {user.lastName}</DialogTitle>
                            <DialogDescription>
                              Make changes to the user's information below.
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid grid-cols-1 lg:grxid-cols-2 gap-6 py-4">
                            {/* Basic Information Section */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Basic Information</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label>First Name</label>
                                  <Input
                                    value={changedValues.firstName ?? user?.firstName ?? ''}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label>Last Name</label>
                                  <Input
                                    value={changedValues.lastName ?? user?.lastName ?? ''}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label>Email</label>
                                  <Input
                                    value={changedValues.email ?? user?.email ?? ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label>Role</label>
                                  <Select
                                    value={changedValues.role ?? user?.role}
                                    onValueChange={(value) => 
                                      handleInputChange('role', value as 'STUDENT' | 'PROFESSOR' | 'ADMIN')
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="STUDENT">Student</SelectItem>
                                      <SelectItem value="PROFESSOR">Professor</SelectItem>
                                      <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Role-specific Information */}
                              <div className="mt-6">
                                <h3 className="font-semibold mb-4">Role Information</h3>
                                {user.role === 'STUDENT' && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label>Roll Number</label>
                                      <Input
                                        value={changedValues.rollNo ?? user?.rollNo ?? ''}
                                        onChange={(e) => handleInputChange('rollNo', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label>Year</label>
                                      <Select
                                        value={changedValues.year ?? user?.year ?? ''}
                                        onValueChange={(value) => handleInputChange('year', value)}
                                      >
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
                                    </div>
                                    <div className="space-y-2">
                                      <label>SRN</label>
                                      <Input
                                        value={changedValues.srn ?? user?.srn ?? ''}
                                        onChange={(e) => handleInputChange('srn', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label>Division</label>
                                      <Select
                                        value={changedValues.division ?? user?.division ?? ''}
                                        onValueChange={(value) => handleInputChange('division', value)}
                                      >
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
                                    </div>
                                  </div>
                                )}
                                {user.role === 'PROFESSOR' && (
                                  <div className="space-y-2">
                                    <label>Office Hours</label>
                                    <Input
                                      value={changedValues.officeHours ?? user?.officeHours ?? ''}
                                      onChange={(e) => handleInputChange('officeHours', e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Class Memberships Section */}
                            <div className="space-y-4">
                              <h3 className="font-semibold">Class Memberships</h3>
                              <div className="border rounded-lg divide-y">
                                {user.memberships?.map((membership) => (
                                  <div key={membership.classroomId} className="p-3 flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{membership.classroom.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {membership.classroom.courseCode} - {membership.classroom.courseName}
                                      </p>
                                    </div>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={() => handleRemoveFromClass(membership.classroomId)}
                                      disabled={isUpdating}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ))}
                                {(!user.memberships || user.memberships.length === 0) && (
                                  <div className="p-3 text-sm text-muted-foreground">
                                    No class memberships
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button 
                              onClick={handleUpdateUser}
                              disabled={Object.keys(changedValues).length === 0 || isUpdating}
                              className="w-full"
                            >
                              {isUpdating ? (
                                <>
                                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, paginatedUsers().totalUsers)} of {paginatedUsers().totalUsers} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(paginatedUsers().totalPages, p + 1))}
                disabled={currentPage === paginatedUsers().totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}