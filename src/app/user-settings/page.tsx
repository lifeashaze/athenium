'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

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

  useEffect(() => {
    const fetchUserData = async () => {
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
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.imageUrl} alt={user.fullName || "User avatar"} />
              <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.fullName}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Personal Information</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={user.firstName || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={user.lastName || ''} disabled />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Academic Information</h3>
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rollNo">Roll Number</Label>
                  <Input
                    id="rollNo"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="division">Division</Label>
                  <Input
                    id="division"
                    name="division"
                    value={formData.division}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="srn">SRN</Label>
                  <Input
                    id="srn"
                    name="srn"
                    value={formData.srn}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="prn">PRN</Label>
                  <Input
                    id="prn"
                    name="prn"
                    value={formData.prn}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Office Hours</h3>
              <Separator className="my-2" />
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="officeHoursStart">Start Time</Label>
                  <Input
                    id="officeHoursStart"
                    name="officeHoursStart"
                    type="time"
                    value={formData.officeHoursStart}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="officeHoursEnd">End Time</Label>
                  <Input
                    id="officeHoursEnd"
                    name="officeHoursEnd"
                    type="time"
                    value={formData.officeHoursEnd}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
