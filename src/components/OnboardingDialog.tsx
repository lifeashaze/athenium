'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<UserDetails>>({})
  const { toast } = useToast()

  const steps = [
    { 
      title: '👋 Hello!', 
      description: "We're thrilled to meet you" 
    },
    { 
      title: '🎨 Your Profile', 
      description: 'Help us personalize your experience' 
    },
    { 
      title: '🌟 Final Touch', 
      description: 'Almost ready for your journey' 
    },
  ]

  const validateStep = () => {
    const newErrors: Partial<UserDetails> = {}
    
    switch (step) {
      case 1:
        if (!userDetails.rollNo) newErrors.rollNo = "Roll number is required"
        if (!userDetails.srn) newErrors.srn = "SRN is required"
        if (!userDetails.prn) newErrors.prn = "PRN is required"
        break
      case 2:
        if (!userDetails.year) newErrors.year = "Year is required"
        if (!userDetails.division) newErrors.division = "Division is required"
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validateStep()) return

    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setIsSubmitting(true)
      try {
        await onSubmit()
        toast({
          title: "✨ Welcome aboard!",
          description: "Your account has been successfully set up.",
        })
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
      } finally {
        setIsSubmitting(false)
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
      <Dialog open={showOnboarding} onOpenChange={(open) => {
        if (!open) {
          toast({
            variant: "destructive",
            title: "👋 Hold On!",
            description: `${user.firstName}, we'd love to get to know you better before you dive in.`,
          })
        }
      }}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto dark:border-gray-800 border-t-0">
          <div className="flex flex-col sm:flex-row h-full">
            {/* Sidebar with more engaging animations */}
            <div className="w-full sm:w-1/3 bg-black dark:bg-gray-900 p-4 sm:p-6 text-white">
              <div className="mt-4 sm:mt-8">
                {steps.map((s, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      opacity: step === index ? 1 : 0.5,
                      scale: step === index ? 1.05 : 1,
                      x: step === index ? 10 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`mb-4 sm:mb-6 p-3 rounded-lg ${
                      step === index ? 'bg-gray-800/30' : ''
                    }`}
                  >
                    <h3 className="text-lg sm:text-xl font-semibold">{s.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-300">{s.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Main Content - More personal welcome messages */}
            <div className="w-full sm:w-2/3 p-4 sm:p-6 dark:bg-background">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 sm:space-y-6"
                >
                  {step === 0 && (
                    <div className="space-y-6">
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-center"
                      >
                        <span className="text-4xl">✨</span>
                      </motion.div>
                      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
                        Welcome, {user.firstName}!
                      </h1>
                      <p className="text-xl text-center text-gray-600 dark:text-gray-400">
                        We&apos;re excited to have you join our community
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                          Here&apos;s what we&apos;ll help you with today:
                        </p>
                        <ul className="space-y-3">
                          {[
                            "Create your personalized learning space 🎨",
                            "Connect you with your academic community 🤝",
                            "Set up your custom dashboard 📊",
                            "Get you ready for an amazing journey 🚀"
                          ].map((item, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.2 }}
                              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
                            >
                              <span className="text-green-500">✓</span>
                              <span>{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold dark:text-foreground">Basic Information</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-200">
                            Roll Number
                          </label>
                          <Input
                            value={userDetails.rollNo || ''}
                            onChange={(e) => {
                              setErrors({ ...errors, rollNo: undefined })
                              const value = e.target.value.replace(/\D/g, '')
                              setUserDetails({ ...userDetails, rollNo: value })
                            }}
                            placeholder="Enter your Roll Number"
                            aria-invalid={!!errors.rollNo}
                            className={errors.rollNo ? 'border-red-500' : ''}
                          />
                          {errors.rollNo && (
                            <p className="text-sm text-red-500 mt-1">{errors.rollNo}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-200">SRN</label>
                          <Input
                            value={userDetails.srn || ''}
                            onChange={(e) => {
                              setErrors({ ...errors, srn: undefined })
                              const value = e.target.value.replace(/\D/g, '')
                              setUserDetails({ ...userDetails, srn: value })
                            }}
                            placeholder="Enter your SRN"
                            aria-invalid={!!errors.srn}
                            className={errors.srn ? 'border-red-500' : ''}
                          />
                          {errors.srn && (
                            <p className="text-sm text-red-500 mt-1">{errors.srn}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-200">PRN</label>
                          <Input
                            value={userDetails.prn || ''}
                            onChange={(e) => {
                              setErrors({ ...errors, prn: undefined })
                              const value = e.target.value.replace(/\D/g, '')
                              setUserDetails({ ...userDetails, prn: value })
                            }}
                            placeholder="Enter your PRN"
                            aria-invalid={!!errors.prn}
                            className={errors.prn ? 'border-red-500' : ''}
                          />
                          {errors.prn && (
                            <p className="text-sm text-red-500 mt-1">{errors.prn}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-semibold dark:text-foreground">Academic Details</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium dark:text-gray-200">Current Year</label>
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
                          <label className="block text-sm font-medium dark:text-gray-200">Division</label>
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

              {/* Updated button section with more personality */}
              <div className="mt-6 sm:mt-8 flex justify-between items-center">
                {step > 0 && (
                  <Button 
                    onClick={() => setStep(step - 1)} 
                    variant="outline"
                    disabled={isSubmitting}
                    className="hover:scale-105 transition-transform"
                  >
                    ← Back
                  </Button>
                )}
                <Button 
                  onClick={handleNext}
                  className={`ml-auto transform hover:scale-105 transition-all ${
                    isStepValid() 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-700'
                  } text-white`}
                  disabled={!isStepValid() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating your space...
                    </>
                  ) : (
                    step === steps.length - 1 ? 
                      "Let's Begin! 🚀" : 
                      "Continue →"
                  )}
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
