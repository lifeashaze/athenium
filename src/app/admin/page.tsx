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
}

function UserSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-6 w-[150px]" /></TableCell>
      <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
      <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
      <TableCell><Skeleton className="h-12 w-[200px]" /></TableCell>
      <TableCell><Skeleton className="h-10 w-[150px]" /></TableCell>
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-8 w-[200px] mb-6" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Details</TableHead>
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
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Manage all users and their permissions</CardDescription>
        </CardHeader>
      </Card>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.firstName} {user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span className={cn(
                  "rounded-full px-2 py-1 text-xs font-semibold",
                  user.role === 'ADMIN' && "bg-red-100 text-red-800",
                  user.role === 'PROFESSOR' && "bg-blue-100 text-blue-800",
                  user.role === 'STUDENT' && "bg-green-100 text-green-800"
                )}>
                  {user.role}
                </span>
              </TableCell>
              <TableCell>
                {user.role === 'STUDENT' && (
                  <>
                    SRN: {user.srn}<br />
                    Roll: {user.rollNo}<br />
                    Year: {user.year}
                  </>
                )}
                {user.role === 'PROFESSOR' && (
                  <>Office Hours: {user.officeHours}</>
                )}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => setEditingUser(user)}
                      disabled={isDeleting === user.id}
                    >
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Edit User: {user.firstName} {user.lastName}</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList>
                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                        <TabsTrigger value="role">Role & Permissions</TabsTrigger>
                        <TabsTrigger value="details">Additional Details</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic">
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label>First Name</label>
                              <Input
                                value={changedValues.firstName ?? editingUser?.firstName ?? ''}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label>Last Name</label>
                              <Input
                                value={changedValues.lastName ?? editingUser?.lastName ?? ''}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label>Email</label>
                              <Input
                                value={changedValues.email ?? editingUser?.email ?? ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="role">
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label>Role</label>
                            <Select
                              value={changedValues.role ?? editingUser?.role}
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
                      </TabsContent>

                      <TabsContent value="details">
                        <div className="space-y-4 py-4">
                          {editingUser?.role === 'STUDENT' && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label>Roll Number</label>
                                  <Input
                                    value={changedValues.rollNo ?? editingUser?.rollNo ?? ''}
                                    onChange={(e) => handleInputChange('rollNo', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label>Year</label>
                                  <Input
                                    value={changedValues.year ?? editingUser?.year ?? ''}
                                    onChange={(e) => handleInputChange('year', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label>SRN</label>
                                  <Input
                                    value={changedValues.srn ?? editingUser?.srn ?? ''}
                                    onChange={(e) => handleInputChange('srn', e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label>Division</label>
                                  <Input
                                    value={changedValues.division ?? editingUser?.division ?? ''}
                                    onChange={(e) => handleInputChange('division', e.target.value)}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                          {editingUser?.role === 'PROFESSOR' && (
                            <div className="space-y-2">
                              <label>Office Hours</label>
                              <Input
                                value={changedValues.officeHours ?? editingUser?.officeHours ?? ''}
                                onChange={(e) => handleInputChange('officeHours', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={handleCloseDialog}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdateUser}
                        disabled={Object.keys(changedValues).length === 0 || isUpdating}
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
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="destructive"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={isDeleting === user.id}
                >
                  {isDeleting === user.id ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}