"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useSimpleToast } from "@/hooks/use-toast"
import { userApi } from "@/lib/api"
import { cn, formatDate, getRoleColor } from "@/lib/utils"
import { UserRole } from "@/types"
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash,
  UserCheck,
  UserX,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  phone?: string | null
  avatar?: string | null
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  rider?: any
  business?: any
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "PRIVATE", label: "Private User" },
  { value: "RIDER", label: "Rider" },
  { value: "BUSINESS", label: "Business" },
  { value: "DEVELOPER", label: "Developer" },
  { value: "SYSTEM_OPERATOR", label: "System Operator" },
  { value: "CUSTOMER_CARE", label: "Customer Care" },
  { value: "REGIONAL_OPERATOR", label: "Regional Operator" },
  { value: "LOCAL_RIDER_MONITOR", label: "Local Rider Monitor" },
]

const roleColors: Record<UserRole, string> = {
  PRIVATE: "bg-blue-100 text-blue-800",
  RIDER: "bg-green-100 text-green-800",
  BUSINESS: "bg-purple-100 text-purple-800",
  DEVELOPER: "bg-orange-100 text-orange-800",
  SYSTEM_OPERATOR: "bg-red-100 text-red-800",
  CUSTOMER_CARE: "bg-cyan-100 text-cyan-800",
  REGIONAL_OPERATOR: "bg-indigo-100 text-indigo-800",
  LOCAL_RIDER_MONITOR: "bg-emerald-100 text-emerald-800",
}

export default function UsersPage() {
  const toast = useSimpleToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    role: "" as UserRole | "",
    search: "",
    isActive: "" as "" | "true" | "false",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "" as UserRole,
    isActive: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [filters, pagination.page, pagination.pageSize])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: pagination.pageSize,
        offset: (pagination.page - 1) * pagination.pageSize,
      }
      
      if (filters.role) params.role = filters.role
      if (filters.search) params.search = filters.search
      if (filters.isActive) params.isActive = filters.isActive
      
      const response = await userApi.getAll(params)
      setUsers(response.data.users)
      setTotal(response.data.total)
    } catch (error: any) {
      console.error("Failed to fetch users:", error)
      toast.error(error.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on filter change
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name || "",
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      isActive: user.isActive,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedUser) return
    
    try {
      await userApi.update(selectedUser.id, editForm)
      toast.success("User updated successfully")
      setIsEditDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      console.error("Failed to update user:", error)
      toast.error(error.message || "Failed to update user")
    }
  }

  const handleDeactivate = async (user: User) => {
    if (user.id === "me") {
      toast.error("Cannot deactivate yourself")
      return
    }
    
    try {
      await userApi.deactivate(user.id)
      toast.success("User deactivated successfully")
      fetchUsers()
    } catch (error: any) {
      console.error("Failed to deactivate user:", error)
      toast.error(error.message || "Failed to deactivate user")
    }
  }

  const handleActivate = async (user: User) => {
    try {
      await userApi.activate(user.id)
      toast.success("User activated successfully")
      fetchUsers()
    } catch (error: any) {
      console.error("Failed to activate user:", error)
      toast.error(error.message || "Failed to activate user")
    }
  }

  const handleDelete = async (user: User) => {
    if (user.id === "me") {
      toast.error("Cannot delete yourself")
      return
    }
    
    if (!confirm(`Are you sure you want to delete ${user.name || user.email}? This cannot be undone.`)) {
      return
    }
    
    try {
      await userApi.delete(user.id)
      toast.success("User deleted successfully")
      fetchUsers()
    } catch (error: any) {
      console.error("Failed to delete user:", error)
      toast.error(error.message || "Failed to delete user")
    }
  }

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    try {
      await userApi.updateRole(user.id, newRole)
      toast.success("User role updated successfully")
      fetchUsers()
    } catch (error: any) {
      console.error("Failed to update user role:", error)
      toast.error(error.message || "Failed to update user role")
    }
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="h-7 w-7" />
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage all platform users, their roles, and access permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: total, color: "bg-primary/10" },
          { label: "Active", value: users.filter(u => u.isActive).length, color: "bg-green-500/10" },
          { label: "Deactivated", value: users.filter(u => !u.isActive).length, color: "bg-red-500/10" },
          { label: "Verified", value: users.filter(u => u.emailVerified).length, color: "bg-blue-500/10" },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={filters.role} onValueChange={(v) => handleFilterChange("role", v as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.isActive} onValueChange={(v) => handleFilterChange("isActive", v)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button onClick={() => setFilters({ role: "", search: "", isActive: "" })} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {total} total users
            </CardDescription>
          </div>
          <Button asChild>
            <a href="/users/add">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </a>
          </Button>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Loading users...</span>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-medium">User</th>
                    <th className="text-left py-3 pr-4 font-medium">Email</th>
                    <th className="text-left py-3 pr-4 font-medium">Role</th>
                    <th className="text-left py-3 pr-4 font-medium">Status</th>
                    <th className="text-left py-3 pr-4 font-medium">Verified</th>
                    <th className="text-left py-3 pr-4 font-medium">Joined</th>
                    <th className="text-right py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
                            {(user.name || user.email).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{user.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{user.phone || "No phone"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">{user.email}</td>
                      <td className="py-3 pr-4">
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user, v as UserRole)}
                          disabled={user.id === "me"}
                        >
                          <SelectTrigger className={cn("w-fit min-w-[120px] text-sm", roleColors[user.role])}>
                            <SelectValue>{user.role.replace(/_/g, ' ')}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Deactivated"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={user.emailVerified ? "default" : "outline"}>
                          {user.emailVerified ? "Verified" : "Pending"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            disabled={user.id === "me"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {user.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivate(user)}
                              disabled={user.id === "me"}
                            >
                              <UserX className="h-4 w-4 text-destructive" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivate(user)}
                            >
                              <UserCheck className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            disabled={user.id === "me"}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No users found matching your filters</p>
            </div>
          )}
        </CardContent>
        
        {/* Pagination */}
        {total > pagination.pageSize && (
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1}-{
                Math.min(pagination.page * pagination.pageSize, total)
              } of {total} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {Math.ceil(total / pagination.pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page * pagination.pageSize >= total}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      {isEditDialogOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
              <CardDescription>
                Update user details for {selectedUser.name || selectedUser.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm(prev => ({ ...prev, role: v as UserRole }))}>
                  <SelectTrigger id="edit-role">
                    <SelectValue>{editForm.role.replace(/_/g, ' ')}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Active</label>
                <Button
                  variant={editForm.isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                >
                  {editForm.isActive ? "Active" : "Deactivated"}
                </Button>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>
                  <Edit className="h-4 w-4 mr-2" />
                  Update User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
