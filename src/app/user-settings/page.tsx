'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserSettingsPage() {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    rollNo: '',
    year: '',
    division: '',
    srn: '',
    prn: '',
    officeHoursStart: '',
    officeHoursEnd: ''
  })
  const [initialFormData, setInitialFormData] = useState({...formData})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/user')
        const userData = await response.json()
        setFormData(userData)
        setInitialFormData(userData)
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (JSON.stringify(formData) === JSON.stringify(initialFormData)) {
      toast({
        title: "No Changes",
        description: "No changes were made to your settings.",
      })
      return
    }

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (response.ok) {
        setInitialFormData(formData)
        toast({
          title: "Success",
          description: "Your settings have been updated.",
        })
      } else {
        throw new Error('Failed to update user settings')
      }
    } catch (error) {
      console.error('Error updating user settings:', error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <Skeleton className="w-20 h-20 rounded-full" />
            ) : (
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.imageUrl} alt={user.fullName || "User avatar"} />
                <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
              </Avatar>
            )}
            <div>
              {isLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <CardTitle className="text-2xl">{user.fullName}</CardTitle>
              )}
              {isLoading ? (
                <Skeleton className="h-4 w-64 mt-2" />
              ) : (
                <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium">Personal Information</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-4">
                {['firstName', 'lastName'].map((field) => (
                  <div key={field}>
                    <Label htmlFor={field}>{field === 'firstName' ? 'First Name' : 'Last Name'}</Label>
                    {isLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input id={field} value={user[field as keyof typeof user]?.toString() || ''} disabled={false} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-medium">Academic Information</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-4">
                {['rollNo', 'year', 'division', 'srn', 'prn'].map((field) => (
                  <div key={field}>
                    <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
                    {isLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        id={field}
                        name={field}
                        value={formData[field as keyof typeof formData]}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Office Hours */}
            <div>
              <h3 className="text-lg font-medium">Office Hours</h3>
              <Separator className="my-2" />
              <div className="flex space-x-4">
                {['officeHoursStart', 'officeHoursEnd'].map((field) => (
                  <div key={field} className="flex-1">
                    <Label htmlFor={field}>{field === 'officeHoursStart' ? 'Start Time' : 'End Time'}</Label>
                    {isLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input
                        id={field}
                        name={field as keyof typeof formData}
                        type="time"
                        value={formData[field as keyof typeof formData]}
                        onChange={handleInputChange}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          {isLoading ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
