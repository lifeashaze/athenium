'use client'

import { motion } from 'framer-motion'
import { Bell, Users, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"


interface ClassInvitationProps {
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
  onAccept: (id: string) => void
  onDismiss: (id: string) => void
}

export function ClassInvitationCard({
  id,
  courseName,
  courseCode,
  year,
  division,
  professor,
  memberCount,
  onAccept,
  onDismiss
}: ClassInvitationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="mb-2"
    >
      <Card className="w-full bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 shadow-sm hover:shadow transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-grow">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {courseName}
                </h3>
                <Badge variant="secondary" className="bg-blue-100/50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 text-xs">
                  New
                </Badge>
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-1">
                  <span>{courseCode}</span>
                  <span>•</span>
                  <span>{year}</span>
                  <span>•</span>
                  <span>Division {division}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Users className="w-3 h-3 mr-1" />
                    <span>{memberCount} joined</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="font-medium">
                      Prof. {professor.firstName} {professor.lastName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 sm:ml-4 justify-end">
              <Button size="sm" variant="ghost" onClick={() => onDismiss(id)}>
                Dismiss
              </Button>
              <Button size="sm" onClick={() => onAccept(id)}>
                Join
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 