'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface UserDetails {
  rollNo: string | null
  srn: string | null
  prn: string | null
  year: string | null
  division: string | null
}

interface OnboardingDialogProps {
  showOnboarding: boolean
  setShowOnboarding: (show: boolean) => void
  userDetails: UserDetails
  setUserDetails: (details: UserDetails) => void
  onSubmit: () => Promise<void>
  user: {
    firstName: string
    lastName?: string
  }
}

export function OnboardingDialog({ 
  showOnboarding, 
  userDetails, 
  setUserDetails,
  onSubmit,
  user 
}: OnboardingDialogProps) {
  const [step, setStep] = useState(0)
  const { toast } = useToast()

  const steps = [
    { title: '👋 Welcome', description: 'Get started with Athenium' },
    { title: '📝 Basic Info', description: 'Tell us about yourself' },
    { title: '🎓 Academic Details', description: 'Share your academic information' },
  ]

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      try {
        await onSubmit()
      } catch (error: any) {
        const errorMessage = error?.response?.data?.error
        if (errorMessage) {
          toast({
            variant: "destructive", 
            title: "❌ Validation Error",
            description: errorMessage,
          })
        } else {
          toast({
            variant: "destructive",
            title: "❌ Error",
            description: "Something went wrong. Please try again.",
          })
        }
      }
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return userDetails.rollNo && userDetails.srn && userDetails.prn
      case 2:
        return userDetails.year && userDetails.division
      default:
        return true
    }
  }

  return (
    <>
      <Dialog 
        open={showOnboarding} 
        onOpenChange={(open) => {
          if (!open) {
            toast({
              variant: "destructive",
              title: "✨ Onboarding Required",
              description: `Hi ${user.firstName}! 👋 Please complete the onboarding process to continue using Athenium.`,
            })
          }
        }}
      >
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <div className="flex h-full">
            <div className="w-1/3 bg-black p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-white">
                  Hello {user.firstName}! 👋
                </DialogTitle>
              </DialogHeader>
              <div className="mt-8">
                {steps.map((s, index) => (
                  <div key={index} className={`mb-6 ${step === index ? 'opacity-100' : 'opacity-50'}`}>
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    <p className="text-sm">{s.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-2/3 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {step === 0 && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold text-center">We&apos;re excited to have you here.</h2>
                      <p className="text-gray-600">Welcome to Athenium, your comprehensive academic management system. We&apos;re excited to help enhance your educational journey! ✨</p>
                      <p className="text-gray-600">In the next steps, we&apos;ll ask for some basic information and your academic details. This will help us:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>📊 Set up your personalized dashboard</li>
                        <li>👥 Connect you with your classrooms and assignments</li>
                        <li>📝 Configure your attendance tracking</li>
                        <li>📚 Enable access to course materials and resources</li>
                      </ul>
                    </div>
                  )}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold">Basic Information</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium">Roll Number</label>
                          <Input
                            value={userDetails.rollNo || ''}
                            onChange={(e) => setUserDetails({ ...userDetails, rollNo: e.target.value })}
                            placeholder="Enter your Roll Number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">SRN</label>
                          <Input
                            value={userDetails.srn || ''}
                            onChange={(e) => setUserDetails({ ...userDetails, srn: e.target.value })}
                            placeholder="Enter your SRN"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">PRN</label>
                          <Input
                            value={userDetails.prn || ''}
                            onChange={(e) => setUserDetails({ ...userDetails, prn: e.target.value })}
                            placeholder="Enter your PRN"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold">Academic Details</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium">Current Year</label>
                          <Select 
                            onValueChange={(value) => setUserDetails({ ...userDetails, year: value })}
                            value={userDetails.year || ''}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="First Year">First Year</SelectItem>
                              <SelectItem value="Second Year">Second Year</SelectItem>
                              <SelectItem value="Third Year">Third Year</SelectItem>
                              <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Division</label>
                          <Input
                            value={userDetails.division || ''}
                            onChange={(e) => setUserDetails({ ...userDetails, division: e.target.value })}
                            placeholder="Enter your division"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="mt-8 flex justify-between items-center">
                {step > 0 && (
                  <Button onClick={() => setStep(step - 1)} variant="outline">
                    Back
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  className={`ml-auto ${isStepValid() ? 'bg-black hover:bg-gray-800' : 'bg-gray-300'} text-white`}
                  disabled={!isStepValid()}
                >
                  {step === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}
