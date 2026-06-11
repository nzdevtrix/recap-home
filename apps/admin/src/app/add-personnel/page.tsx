"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useSimpleToast } from "@/hooks/use-toast"
import { adminApi } from "@/lib/api"
import { cn, getRoleColor } from "@/lib/utils"
import {
  UserPlus,
  Users,
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"

const internalRoles = [
  { value: "SYSTEM_OPERATOR", label: "System Operator" },
  { value: "DEVELOPER", label: "Developer" },
  { value: "CUSTOMER_CARE", label: "Customer Care" },
  { value: "REGIONAL_OPERATOR", label: "Regional Operator" },
  { value: "LOCAL_RIDER_MONITOR", label: "Local Rider Monitor" },
]

const allRoles = [
  ...internalRoles,
  { value: "PRIVATE", label: "Private User" },
  { value: "RIDER", label: "Rider" },
  { value: "BUSINESS", label: "Business" },
]

export default function AddPersonnelPage() {
  const router = useRouter()
  const toast = useSimpleToast()
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: internalRoles[0].value,
    phone: "",
    password: "",
    confirmPassword: "",
  })
  
  const [recentlyAdded, setRecentlyAdded] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isInternalRole, setIsInternalRole] = useState(true)

  useEffect(() => {
    // Check if selected role is internal
    setIsInternalRole(internalRoles.some(r => r.value === formData.role))
  }, [formData.role])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    if (!formData.email || !formData.name) {
      toast.error("Email and name are required")
      return
    }
    
    if (isInternalRole && !formData.password) {
      toast.error("Password is required for internal personnel")
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    
    if (formData.password && formData.password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    
    try {
      setLoading(true)
      
      // Call API to add personnel
      // Note: This will need to be implemented in the API
      // For now, we'll simulate the call
      
      const response = await adminApi.addPersonnel({
        email: formData.email,
        name: formData.name,
        role: formData.role as any,
        phone: formData.phone,
        password: formData.password,
      })
      
      toast.success(`Successfully added ${formData.name} as ${formData.role.replace(/_/g, ' ')}`)
      
      // Add to recently added list
      setRecentlyAdded(prev => [
        {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        },
        ...prev.slice(0, 4),
      ])
      
      // Reset form
      setFormData({
        email: "",
        name: "",
        role: internalRoles[0].value,
        phone: "",
        password: "",
        confirmPassword: "",
      })
      
    } catch (error: any) {
      console.error("Failed to add personnel:", error)
      toast.error(error.message || "Failed to add personnel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserPlus className="h-7 w-7" />
          Add Personnel
        </h1>
        <p className="text-muted-foreground">
          Directly add internal personnel to the platform. This bypasses the normal registration flow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Add New Personnel</CardTitle>
              <CardDescription>
                Fill in the details below to add new personnel directly to the system
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="personnel@recap-home.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIVATE">Private User</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                      <SelectItem value="RIDER">Rider</SelectItem>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-accent/50">
                        Internal Roles (Direct Add)
                      </div>
                      {internalRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+39 123 456 7890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Password (for internal roles) */}
                {isInternalRole && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required={isInternalRole}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required={isInternalRole}
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full lg:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Personnel
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Internal Roles:</p>
                  <p className="text-muted-foreground">
                    SYSTEM_OPERATOR, DEVELOPER, CUSTOMER_CARE, REGIONAL_OPERATOR, LOCAL_RIDER_MONITOR
                  </p>
                  <p className="text-muted-foreground mt-1">
                    These roles are added directly via this form and bypass normal registration.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Auto-Approval:</p>
                  <p className="text-muted-foreground">
                    Business and Rider registrations require approval. Internal personnel are auto-approved.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Public Registration:</p>
                  <p className="text-muted-foreground">
                    PRIVATE users, BUSINESS owners, and RIDERS can register autonomously via the public registration pages.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recently Added */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Personnel</CardTitle>
              <CardDescription>
                Last 5 additions
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {recentlyAdded.length > 0 ? (
                <div className="space-y-3">
                  {recentlyAdded.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
                            {person.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{person.name}</p>
                            <p className="text-xs text-muted-foreground">{person.email}</p>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(getRoleColor(person.role))}>
                        {person.role.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No personnel added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Add */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Add System Operator", role: "SYSTEM_OPERATOR" },
                { label: "Add Customer Care", role: "CUSTOMER_CARE" },
                { label: "Add Developer", role: "DEVELOPER" },
              ].map((action) => (
                <Button
                  key={action.role}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      role: action.role,
                    }))
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
