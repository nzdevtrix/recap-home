"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSimpleToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  Loader2,
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
} from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const toast = useSimpleToast()
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      // Verify token is valid
      authApi.getMe()
        .then(() => router.push('/dashboard'))
        .catch(() => {})
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return
    }
    
    try {
      setLoading(true)
      const response = await authApi.login(formData.email, formData.password)
      
      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      
      // Check if user is admin
      const user = response.data.user
      if (!user) {
        setError("Invalid credentials")
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        return
      }
      
      // Check if user has admin role
      const adminRoles = [
        'SYSTEM_OPERATOR',
        'DEVELOPER',
        'CUSTOMER_CARE',
        'REGIONAL_OPERATOR',
        'LOCAL_RIDER_MONITOR'
      ]
      
      if (!adminRoles.includes(user.role)) {
        setError("Access denied. Admin credentials required.")
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        return
      }
      
      toast.success(`Welcome back, ${user.name || user.email}!`)
      router.push('/dashboard')
      
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Invalid email or password")
      toast.error(error.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Recap Home Admin</CardTitle>
          <CardDescription>
            Infrastructure Management Portal
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@recap-home.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-12"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <Label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" className="sr-only" />
                <span className="text-muted-foreground">Remember me</span>
              </Label>
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t text-center text-sm">
            <p className="text-muted-foreground">
              Don&apos;t have an admin account? Contact system administrator.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Recap Home - Infrastructure Management Portal</p>
        <p className="mt-1">© {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </div>
  )
}
