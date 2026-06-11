"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useSimpleToast } from "@/hooks/use-toast"
import { adminApi } from "@/lib/api"
import { getSeverityColor } from "@/lib/utils"
import {
  AlertTriangle,
  Bell,
  Settings,
  Shield,
  User,
  ShoppingBag,
  Bike,
  Loader2,
  Send,
  X,
  CheckCircle,
} from "lucide-react"

interface Alert {
  id: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  createdAt: string
  createdBy: string
  isActive: boolean
}

const severityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export default function EmergencyPage() {
  const toast = useSimpleToast()
  const [maintenanceMode, setMaintenanceMode] = useState({
    enabled: false,
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    severity: "high" as 'low' | 'medium' | 'high' | 'critical',
  })
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
    fetchRecentAlerts()
    
    // Listen for maintenance mode changes (from Socket.io)
    // In production, this would be connected via Socket.io
  }, [])

  const fetchStats = async () => {
    try {
      const response = await adminApi.getSystemStatus()
      setStats(response.data)
    } catch (error: any) {
      console.error("Failed to fetch system status:", error)
    }
  }

  const fetchRecentAlerts = async () => {
    // In production, fetch from API
    // For now, use dummy data
    setRecentAlerts([])
  }

  const handleMaintenanceToggle = async () => {
    try {
      setLoading(true)
      const response = await adminApi.setMaintenanceMode(
        !maintenanceMode.enabled,
        maintenanceMode.message || "System under maintenance"
      )
      setMaintenanceMode(prev => ({ ...prev, enabled: !prev.enabled }))
      toast.success(`Maintenance mode ${!maintenanceMode.enabled ? 'enabled' : 'disabled'}`)
    } catch (error: any) {
      console.error("Failed to toggle maintenance mode:", error)
      toast.error(error.message || "Failed to update maintenance mode")
    } finally {
      setLoading(false)
    }
  }

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error("Title and message are required")
      return
    }
    
    try {
      setLoading(true)
      const response = await adminApi.broadcastAlert({
        ...broadcastForm,
        severity: broadcastForm.severity,
      })
      
      toast.success("System alert broadcast successfully")
      
      // Add to recent alerts
      setRecentAlerts(prev => [
        {
          ...broadcastForm,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          createdBy: "You",
          isActive: true,
        },
        ...prev.slice(0, 4),
      ])
      
      // Reset form
      setBroadcastForm({
        title: "",
        message: "",
        severity: "high",
      })
      
    } catch (error: any) {
      console.error("Failed to broadcast alert:", error)
      toast.error(error.message || "Failed to broadcast alert")
    } finally {
      setLoading(false)
    }
  }

  const emergencyActions = [
    {
      title: "Enable Maintenance Mode",
      description: "Put the system in maintenance mode. All users will see a maintenance page.",
      action: handleMaintenanceToggle,
      icon: Settings,
      color: "bg-orange-100",
    },
    {
      title: "Broadcast System Alert",
      description: "Send an urgent alert to all connected users.",
      action: () => {},
      icon: Bell,
      color: "bg-red-100",
    },
    {
      title: "Deactivate All Riders",
      description: "Emergency deactivation of all active riders.",
      action: () => toast.warning("This action would deactivate all riders"),
      icon: Bike,
      color: "bg-yellow-100",
    },
    {
      title: "Suspend All Businesses",
      description: "Emergency suspension of all business operations.",
      action: () => toast.warning("This action would suspend all businesses"),
      icon: ShoppingBag,
      color: "bg-orange-100",
    },
  ]

  return (
    <div className="container mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <AlertTriangle className="h-7 w-7" />
          Emergency Controls
        </h1>
        <p className="text-muted-foreground">
          System-wide emergency management and controls
        </p>
      </div>

      {/* System Status Card */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats ? (
              <>
                <div className="text-center p-3 rounded-lg bg-white/50">
                  <p className="text-2xl font-bold text-green-600">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/50">
                  <p className="text-2xl font-bold text-blue-600">{stats.totalBusinesses}</p>
                  <p className="text-sm text-muted-foreground">Businesses</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/50">
                  <p className="text-2xl font-bold text-purple-600">{stats.totalRiders}</p>
                  <p className="text-sm text-muted-foreground">Available Riders</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/50">
                  <p className="text-2xl font-bold text-orange-600">{stats.activeOrders}</p>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                </div>
              </>
            ) : (
              <div className="col-span-4 text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading system status...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Emergency Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emergencyActions.map((action, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <action.icon className="h-5 w-5" />
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    action.action()
                  }}
                >
                  Execute
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Maintenance Mode
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode Control</CardTitle>
            <CardDescription>
              {maintenanceMode.enabled ? "SYSTEM IS CURRENTLY IN MAINTENANCE MODE" : "System is operating normally"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-full",
                maintenanceMode.enabled ? "bg-red-100" : "bg-green-100"
              )}>
                {maintenanceMode.enabled ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {maintenanceMode.enabled ? "Maintenance Mode Active" : "Maintenance Mode Inactive"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {maintenanceMode.enabled 
                    ? "All users will see a maintenance page and cannot place new orders."
                    : "The system is fully operational."}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <Input
                  id="maintenance-message"
                  placeholder="System under maintenance. We'll be back shortly."
                  value={maintenanceMode.message}
                  onChange={(e) => setMaintenanceMode(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              
              <Button
                variant={maintenanceMode.enabled ? "destructive" : "default"}
                onClick={handleMaintenanceToggle}
                disabled={loading}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : maintenanceMode.enabled ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Disable Maintenance Mode
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Enable Maintenance Mode
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcast Alert */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Broadcast System Alert
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Send System-Wide Alert</CardTitle>
            <CardDescription>
              Broadcast an urgent alert to all connected users via notification and socket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBroadcastAlert} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alert-title">Alert Title *</Label>
                <Input
                  id="alert-title"
                  placeholder="e.g., System Outage, Security Alert"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alert-message">Alert Message *</Label>
                <Input
                  id="alert-message"
                  placeholder="e.g., We are experiencing technical difficulties..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alert-severity">Severity Level</Label>
                <Select
                  value={broadcastForm.severity}
                  onValueChange={(v) => setBroadcastForm(prev => ({ ...prev, severity: v as 'low' | 'medium' | 'high' | 'critical' }))}
                >
                  <SelectTrigger id="alert-severity">
                    <SelectValue>{broadcastForm.severity.replace(/^\w/, (m) => m.toUpperCase())}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {severityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className={cn("flex items-center gap-2", getSeverityColor(option.value as any))}>
                          <span className="h-2 w-2 rounded-full bg-current"></span>
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                type="submit"
                disabled={loading || !broadcastForm.title || !broadcastForm.message}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Broadcast Alert
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Recent Alerts
        </h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Alert History</CardTitle>
            <CardDescription>
              Last 5 system alerts broadcast
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAlerts.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-lg border-l-4",
                      getSeverityColor(alert.severity)
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(getSeverityColor(alert.severity))}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <h4 className="font-semibold">{alert.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Broadcast by {alert.createdBy} • {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.isActive && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No alerts broadcast yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Help Section */}
      <Card className="bg-yellow-50/50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-700 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergency Help
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Need Immediate Help?</p>
              <p className="text-sm text-muted-foreground">
                Contact the development team or system administrator
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">System Issues?</p>
              <p className="text-sm text-muted-foreground">
                Check the system logs or enable maintenance mode
              </p>
            </div>
          </div>
          <div className="pt-2">
            <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-200">
              View System Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
