"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn, getInitials } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { useSimpleToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api"

interface HeaderProps {
  className?: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export function Header({ className }: HeaderProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState(""
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const toast = useSimpleToast()

  useEffect(() => {
    // Fetch current user
    fetchUser()
    fetchNotifications()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await authApi.getMe()
      setUser(response.data.user)
    } catch (error) {
      console.error("Failed to fetch user:", error)
      router.push("/login")
    }
  }

  const fetchNotifications = async () => {
    try {
      // This will be implemented in the API
      // For now, just set some dummy data
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      router.push("/login")
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const markAllAsRead = async () => {
    try {
      // API call to mark all as read
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  return (
    <header className={cn("border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Search and Mobile Menu */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="relative">
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px] lg:w-[300px] pl-10 pr-4 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right side - User and Notifications */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              
              {/* Notifications dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-background rounded-md shadow-lg border z-50">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-3 border-b last:border-0 hover:bg-accent/50 cursor-pointer",
                            !notification.isRead && "bg-accent/50"
                          )}
                          onClick={() => {
                            // Mark as read and navigate if needed
                            setNotifications(
                              notifications.map(n => 
                                n.id === notification.id ? { ...n, isRead: true } : n
                              )
                            )
                            setUnreadCount(prev => Math.max(0, prev - 1))
                          }}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              <Badge variant={notification.isRead ? "secondary" : "default"}>
                                {notification.type}
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No new notifications
                      </div>
                    )}
                  </div>
                  
                  <div className="p-2 border-t">
                    <Link href="/notifications" className="block text-center text-sm text-primary hover:underline" onClick={() => setIsNotificationsOpen(false)}>
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
                  {user ? getInitials(user.name) : "U"}
                </div>
                {user && (
                  <>
                    <span className="hidden lg:inline-block text-sm font-medium">{user.name}</span>
                    <Badge variant="secondary" className="hidden lg:inline-block text-xs">
                      {user.role.replace(/_/g, ' ')}
                    </Badge>
                  </>
                )}
                <ChevronDown className="h-4 w-4 hidden lg:block" />
              </Button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background rounded-md shadow-lg border z-50">
                  <div className="p-4 border-b">
                    {user && (
                      <>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {user.role.replace(/_/g, ' ')}
                        </Badge>
                      </>
                    )}
                  </div>
                  
                  <div className="p-2">
                    <Link
                      href="/settings/profile"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent/50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent/50"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </div>
                  
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
