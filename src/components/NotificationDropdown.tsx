'use client'

import { useState, useEffect } from 'react'
import { Bell, Book, Users, UserPlus, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationType } from '@prisma/client'
import axios from 'axios'

interface NotificationDropdownProps {
  userId?: string | null;
}

interface Notification {
  id: number
  message: string
  type: NotificationType
  createdAt: string
  read: boolean
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'ASSIGNMENT':
      return {
        icon: <Book className="h-4 w-4 text-blue-600" />,
        bgColor: 'bg-blue-100'
      };
    case 'ATTENDANCE':
      return {
        icon: <Users className="h-4 w-4 text-green-600" />,
        bgColor: 'bg-green-100'
      };
    case 'MEMBERSHIP':
      return {
        icon: <UserPlus className="h-4 w-4 text-purple-600" />,
        bgColor: 'bg-purple-100'
      };
    case 'RESOURCE':
      return {
        icon: <FileText className="h-4 w-4 text-orange-600" />,
        bgColor: 'bg-orange-100'
      };
    default:
      return {
        icon: <Bell className="h-4 w-4 text-gray-600" />,
        bgColor: 'bg-gray-100'
      };
  }
};

export function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications')
        const { notifications } = response.data
        setNotifications(notifications)
        setUnreadCount(notifications.filter((n: Notification) => !n.read).length)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    if (userId) {
      fetchNotifications()
    }
  }, [userId])

  const markAsRead = async (notificationId: number) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`)
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => prev - 1)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/read-all')
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (open && unreadCount > 0) {
        markAllAsRead()
      }
    }}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative hover:bg-muted/50 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 text-[10px] font-medium flex items-center justify-center text-white bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[400px] p-0 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div key={notification.id}>
                <DropdownMenuItem 
                  className="px-4 py-4 cursor-pointer focus:bg-muted/50 hover:bg-muted/50 transition-colors"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-4 items-start w-full">
                    <div className={`mt-1 p-2.5 rounded-full ${
                      getNotificationIcon(notification.type).bgColor
                    } transition-transform group-hover:scale-105`}>
                      {getNotificationIcon(notification.type).icon}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className={`text-sm leading-tight ${
                        !notification.read ? 'font-medium' : ''
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/75">
                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse" />
                    )}
                  </div>
                </DropdownMenuItem>
                {index < notifications.length - 1 && <Separator className="opacity-50" />}
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 