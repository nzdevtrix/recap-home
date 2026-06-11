"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { adminApi } from "@/lib/api"
import { useSimpleToast } from "@/hooks/use-toast"
import { formatNumber, formatCurrency, getStatusColor } from "@/lib/utils"
import {
  Users,
  Building,
  Bike,
  ShoppingBag,
  Map,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Activity,
} from "lucide-react"

interface StatCard {
  title: string
  value: string | number
  icon: React.ElementType
  change?: string
  changeType?: "up" | "down"
  color?: string
}

const statCards: StatCard[] = [
  {
    title: "Total Users",
    value: "0",
    icon: Users,
    change: "+12%",
    changeType: "up",
    color: "text-blue-600",
  },
  {
    title: "Active Businesses",
    value: "0",
    icon: Building,
    change: "+5%",
    changeType: "up",
    color: "text-green-600",
  },
  {
    title: "Available Riders",
    value: "0",
    icon: Bike,
    change: "-2",
    changeType: "down",
    color: "text-orange-600",
  },
  {
    title: "Active Orders",
    value: "0",
    icon: ShoppingBag,
    change: "+3",
    changeType: "up",
    color: "text-purple-600",
  },
  {
    title: "Total Revenue",
    value: "€0",
    icon: Package,
    change: "+15%",
    changeType: "up",
    color: "text-emerald-600",
  },
]

interface RecentActivity {
  id: string
  type: "user" | "business" | "rider" | "order"
  title: string
  message: string
  timestamp: string
  status?: string
}

const recentActivities: RecentActivity[] = [
  {
    id: "1",
    type: "user",
    title: "New User Registration",
    message: "John Doe registered as a private user",
    timestamp: "2 min ago",
  },
  {
    id: "2",
    type: "business",
    title: "Business Application",
    message: "Pizza Express submitted registration",
    timestamp: "10 min ago",
    status: "PENDING",
  },
  {
    id: "3",
    type: "rider",
    title: "Rider Approved",
    message: "Marco Rossi approved as rider",
    timestamp: "1 hour ago",
    status: "APPROVED",
  },
  {
    id: "4",
    type: "order",
    title: "New Order",
    message: "Order #12345 created",
    timestamp: "2 hours ago",
    status: "PENDING",
  },
]

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }>
}

const ordersChartData: ChartData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Orders",
      data: [120, 190, 300, 500, 200, 300, 450],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.2)",
    },
  ],
}

const revenueChartData: ChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Revenue",
      data: [10000, 15000, 12000, 20000, 18000, 25000],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.2)",
    },
  ],
}

const usersChartData: ChartData = {
  labels: ["PRIVATE", "RIDER", "BUSINESS", "ADMIN"],
  datasets: [
    {
      label: "Users by Role",
      data: [1500, 300, 200, 50],
      borderColor: ["#3b82f6", "#10b981", "#a855f7", "#ef4444"],
      backgroundColor: [
        "rgba(59, 130, 246, 0.2)",
        "rgba(16, 185, 129, 0.2)",
        "rgba(168, 85, 247, 0.2)",
        "rgba(239, 68, 68, 0.2)",
      ],
    },
  ],
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useSimpleToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch dashboard stats from API
      // For now, using dummy data
      const response = await adminApi.getStats()
      setStats(response.data || {})
    } catch (err: any) {
      console.error("Failed to fetch stats:", err)
      setError(err.message || "Failed to load dashboard data")
      toast.error(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = () => {
    fetchStats()
    toast.info("Refreshing dashboard data...")
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={refreshStats}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome to Recap Home Control Center</h1>
            <p className="mt-2 opacity-90">
              Infrastructure Management Portal - Manage all platform operations from here
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-3xl font-bold">{formatNumber(stats?.totalUsers || 0)}</p>
              <p className="text-sm opacity-90">Active Users</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{formatNumber(stats?.totalOrders || 0)}</p>
              <p className="text-sm opacity-90">Total Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={cn("p-2 rounded-md", stat.color || "bg-primary/10")}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change && (
                  <span className={cn(
                    "flex items-center gap-1",
                    stat.changeType === "up" ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.changeType === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.change}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-muted-foreground text-sm">
                Chart visualization will be added here
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Pending: 15</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span>In Transit: 8</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Delivered: 120</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-muted-foreground text-sm">
                Chart visualization will be added here
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div>
                <p className="font-semibold">{formatCurrency(15000)}</p>
                <p className="text-muted-foreground text-xs">Today</p>
              </div>
              <div>
                <p className="font-semibold">{formatCurrency(45000)}</p>
                <p className="text-muted-foreground text-xs">This Week</p>
              </div>
              <div>
                <p className="font-semibold">{formatCurrency(180000)}</p>
                <p className="text-muted-foreground text-xs">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Users by Role and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-muted-foreground text-sm">
                Pie chart will be added here
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              {[
                { label: "Private Users", value: stats?.users?.byRole?.PRIVATE || 0, color: "bg-blue-100" },
                { label: "Riders", value: stats?.users?.byRole?.RIDER || 0, color: "bg-green-100" },
                { label: "Businesses", value: stats?.users?.byRole?.BUSINESS || 0, color: "bg-purple-100" },
                { label: "Admins", value: stats?.users?.byRole?.SYSTEM_OPERATOR || 0, color: "bg-red-100" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded-full", item.color)} />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-medium">{formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {activity.type === "user" && (
                      <Users className="h-5 w-5 text-blue-600" />
                    )}
                    {activity.type === "business" && (
                      <Building className="h-5 w-5 text-purple-600" />
                    )}
                    {activity.type === "rider" && (
                      <Bike className="h-5 w-5 text-green-600" />
                    )}
                    {activity.type === "order" && (
                      <ShoppingBag className="h-5 w-5 text-orange-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.message}</p>
                    {activity.status && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-1 text-xs",
                          getStatusColor(activity.status, activity.type)
                        )}
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Add User", href: "/users/add" },
              { label: "Add Business", href: "/businesses/add" },
              { label: "Add Rider", href: "/riders/add" },
              { label: "Add Region", href: "/regions/add" },
              { label: "View Orders", href: "/orders" },
              { label: "Settings", href: "/settings" },
            ].map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="w-full h-auto py-4"
                asChild
              >
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
