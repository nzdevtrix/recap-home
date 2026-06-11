"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useSimpleToast } from "@/hooks/use-toast"
import { riderApi, adminApi } from "@/lib/api"
import { cn, formatDate, getStatusColor } from "@/lib/utils"
import { RiderApprovalStatus } from "@/types"
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
  Bike,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Shield,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Car,
  Motorbike,
  Bicycle,
  DollarSign,
  Star,
  AlertTriangle,
  BarChart3,
} from "lucide-react"

interface Rider {
  id: string
  userId: string
  user: {
    id: string
    email: string
    name: string | null
    phone?: string | null
    avatar?: string | null
    googleImage?: string | null
    role: string
    createdAt: Date
  }
  profile: {
    id: string
    userId: string
    fullName: string
    dateOfBirth: Date
    placeOfBirth: string
    nationality: string
    codiceFiscale: string
    residenceAddress: string
    domicileAddress?: string | null
    desiredWorkCity: string
    hasBusiness: boolean
    vatId?: string | null
    hasPermessoDiSoggiorno: boolean
    approvalStatus: RiderApprovalStatus
    approvedById?: string | null
    approvedAt?: Date | null
    rejectionReason?: string | null
    reviewedAt?: Date | null
    licenseNumber?: string | null
    licenseImage?: string | null
    vehicleType?: string | null
    vehiclePlate?: string | null
    vehicleColor?: string | null
    regionId: string
    isAvailable: boolean
    currentShiftId?: string | null
    rating: number
    totalRatings: number
    createdAt: Date
    updatedAt: Date
    backgroundCheckNotes?: string | null
    backgroundCheckStatus?: string | null
  }
  region: {
    id: string
    name: string
    code: string
  }
  currentShift?: any | null
  isAvailable: boolean
  orders: Array<{
    id: string
    status: string
    createdAt: Date
  }>
}

const approvalStatusOptions = [
  { value: "", label: "All Statuses" },
  { value: RiderApprovalStatus.PENDING, label: "Pending" },
  { value: RiderApprovalStatus.APPROVED, label: "Approved" },
  { value: RiderApprovalStatus.REJECTED, label: "Rejected" },
]

const vehicleTypeOptions = [
  { value: "car", label: "Car", icon: Car },
  { value: "motorbike", label: "Motorbike", icon: Motorbike },
  { value: "bicycle", label: "Bicycle", icon: Bicycle },
  { value: "scooter", label: "Scooter", icon: Motorbike },
]

const statusColors: Record<RiderApprovalStatus, string> = {
  [RiderApprovalStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [RiderApprovalStatus.APPROVED]: "bg-green-100 text-green-800",
  [RiderApprovalStatus.REJECTED]: "bg-red-100 text-red-800",
}

const statusBadges: Record<RiderApprovalStatus, { icon: React.ElementType; label: string }> = {
  [RiderApprovalStatus.PENDING]: { icon: Clock, label: "Pending" },
  [RiderApprovalStatus.APPROVED]: { icon: CheckCircle, label: "Approved" },
  [RiderApprovalStatus.REJECTED]: { icon: XCircle, label: "Rejected" },
}

export default function RidersPage() {
  const toast = useSimpleToast()
  const [riders, setRiders] = useState<Rider[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    approvalStatus: "" as RiderApprovalStatus | "",
    search: "",
    regionId: "",
    isAvailable: "" as "" | "true" | "false",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
  })
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [approveForm, setApproveForm] = useState({
    notes: "",
    backgroundCheckStatus: "COMPLETED",
  })
  const [rejectForm, setRejectForm] = useState({
    reason: "",
  })
  const [regions, setRegions] = useState<Array<{ id: string; name: string; code: string }>>([])
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchRiders()
    fetchRegions()
  }, [filters, pagination.page, pagination.pageSize])

  useEffect(() => {
    fetchRegions()
  }, [])

  const fetchRiders = async () => {
    try {
      setLoading(true)
      const params: any = {
        limit: pagination.pageSize,
        offset: (pagination.page - 1) * pagination.pageSize,
      }

      if (filters.approvalStatus) params.approvalStatus = filters.approvalStatus
      if (filters.search) params.search = filters.search
      if (filters.regionId) params.regionId = filters.regionId
      if (filters.isAvailable) params.isAvailable = filters.isAvailable

      const response = await riderApi.getAll(params)
      setRiders(response.data.riders)
      setTotal(response.data.total)
    } catch (error: any) {
      console.error("Failed to fetch riders:", error)
      toast.error(error.message || "Failed to load riders")
    } finally {
      setLoading(false)
    }
  }

  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/regions')
      if (response.ok) {
        const data = await response.json()
        setRegions(data)
      }
    } catch (error: any) {
      console.error("Failed to fetch regions:", error)
      setRegions([])
    }
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleApprove = async () => {
    if (!selectedRider) return

    try {
      setActionLoading(true)
      await riderApi.approve(selectedRider.id, approveForm.notes)
      toast.success("Rider approved successfully")
      setIsApproveDialogOpen(false)
      setSelectedRider(null)
      fetchRiders()
    } catch (error: any) {
      console.error("Failed to approve rider:", error)
      toast.error(error.message || "Failed to approve rider")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRider || !rejectForm.reason) return

    try {
      setActionLoading(true)
      await riderApi.reject(selectedRider.id, rejectForm.reason)
      toast.success("Rider rejected successfully")
      setIsRejectDialogOpen(false)
      setSelectedRider(null)
      fetchRiders()
    } catch (error: any) {
      console.error("Failed to reject rider:", error)
      toast.error(error.message || "Failed to reject rider")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateAvailability = async (rider: Rider, isAvailable: boolean) => {
    try {
      await riderApi.updateAvailability(rider.id, isAvailable)
      toast.success(`Rider ${isAvailable ? 'activated' : 'deactivated'} successfully`)
      fetchRiders()
    } catch (error: any) {
      console.error(`Failed to update rider availability:`, error)
      toast.error(error.message || `Failed to update rider availability`)
    }
  }

  const getVehicleIcon = (vehicleType: string | undefined) => {
    if (!vehicleType) return Bike
    const found = vehicleTypeOptions.find(v => v.value === vehicleType.toLowerCase())
    return found?.icon || Bike
  }

  const calculateCompletionPercentage = (rider: Rider) => {
    const profile = rider.profile
    if (!profile) return 0

    const requiredFields = [
      profile.fullName,
      profile.dateOfBirth,
      profile.placeOfBirth,
      profile.nationality,
      profile.codiceFiscale,
      profile.residenceAddress,
      profile.desiredWorkCity,
      profile.licenseNumber,
      profile.vehicleType,
      profile.vehiclePlate,
    ]

    const completedFields = requiredFields.filter(f => f && f !== "" && f !== null).length
    return Math.round((completedFields / requiredFields.length) * 100)
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bike className="h-7 w-7" />
          Rider Management
        </h1>
        <p className="text-muted-foreground">
          Manage all rider applications, approvals, and assignments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Riders",
            value: total,
            color: "bg-primary/10",
            icon: Users,
          },
          {
            label: "Pending Approval",
            value: riders.filter(r => r.profile?.approvalStatus === RiderApprovalStatus.PENDING).length,
            color: "bg-yellow-500/10",
            icon: Clock,
          },
          {
            label: "Approved",
            value: riders.filter(r => r.profile?.approvalStatus === RiderApprovalStatus.APPROVED).length,
            color: "bg-green-500/10",
            icon: CheckCircle,
          },
          {
            label: "Rejected",
            value: riders.filter(r => r.profile?.approvalStatus === RiderApprovalStatus.REJECTED).length,
            color: "bg-red-500/10",
            icon: XCircle,
          },
        ].map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <div className={cn("p-2 rounded-md", stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </div>
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
            <Label className="text-sm font-medium">Search</Label>
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
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={filters.approvalStatus}
              onValueChange={(v) => handleFilterChange("approvalStatus", v as RiderApprovalStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {approvalStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.value && statusBadges[option.value as RiderApprovalStatus]?.icon && (
                        <statusBadges[option.value as RiderApprovalStatus].icon className="h-4 w-4" />
                      )}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Region</Label>
            <Select
              value={filters.regionId}
              onValueChange={(v) => handleFilterChange("regionId", v)}
              disabled={regions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="All regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name} ({region.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Availability</Label>
            <Select
              value={filters.isAvailable}
              onValueChange={(v) => handleFilterChange("isAvailable", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Available</SelectItem>
                <SelectItem value="false">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() =>
                setFilters({
                  approvalStatus: "",
                  search: "",
                  regionId: "",
                  isAvailable: "",
                })
              }
              variant="outline"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Riders Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>All Riders</CardTitle>
            <CardDescription>{total} total riders</CardDescription>
          </div>
          <Button asChild>
            <a href="/add-personnel">
              <Plus className="h-4 w-4 mr-2" />
              Add Rider
            </a>
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Loading riders...</span>
            </div>
          ) : riders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-medium">Rider</th>
                    <th className="text-left py-3 pr-4 font-medium">Contact</th>
                    <th className="text-left py-3 pr-4 font-medium">Region</th>
                    <th className="text-left py-3 pr-4 font-medium">Vehicle</th>
                    <th className="text-left py-3 pr-4 font-medium">Status</th>
                    <th className="text-left py-3 pr-4 font-medium">Rating</th>
                    <th className="text-left py-3 pr-4 font-medium">Joined</th>
                    <th className="text-right py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {riders.map((rider) => (
                    <tr
                      key={rider.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium text-sm">
                            {(rider.user.name || rider.user.email)
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {rider.profile?.fullName || rider.user.name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {rider.user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="space-y-0.5">
                          <p className="text-sm">
                            <Mail className="h-3 w-3 inline mr-1" />
                            {rider.user.email}
                          </p>
                          {rider.user.phone && (
                            <p className="text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 inline mr-1" />
                              {rider.user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {rider.region?.name || "Unknown"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1">
                          {getVehicleIcon(rider.profile?.vehicleType)({
                            className: "h-4 w-4 text-muted-foreground",
                          })}
                          <span className="text-sm">
                            {rider.profile?.vehicleType || "Not specified"}
                          </span>
                          {rider.profile?.vehiclePlate && (
                            <Badge variant="outline" className="text-xs ml-1">
                              {rider.profile.vehiclePlate}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        {rider.profile && (
                          <div className="space-y-1">
                            <Badge
                              className={cn(
                                "text-xs",
                                statusColors[rider.profile.approvalStatus]
                              )}
                            >
                              {statusBadges[rider.profile.approvalStatus].icon({
                                className: "h-3 w-3 mr-1",
                              })}
                              {rider.profile.approvalStatus.replace(/_/g, " ")}
                            </Badge>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-primary h-1 rounded-full"
                                style={{
                                  width: `${calculateCompletionPercentage(rider)}%`,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground block">
                              {calculateCompletionPercentage(rider)}% complete
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">
                            {rider.profile?.rating || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({rider.profile?.totalRatings || 0})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-muted-foreground">
                        {formatDate(rider.user.createdAt)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRider(rider)
                              setIsDetailDialogOpen(true)
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>

                          {rider.profile?.approvalStatus === RiderApprovalStatus.PENDING && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-600"
                                onClick={() => {
                                  setSelectedRider(rider)
                                  setIsApproveDialogOpen(true)
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-600"
                                onClick={() => {
                                  setSelectedRider(rider)
                                  setIsRejectDialogOpen(true)
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {rider.profile?.approvalStatus === RiderApprovalStatus.APPROVED && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleUpdateAvailability(rider, !rider.isAvailable)
                              }
                            >
                              {rider.isAvailable ? (
                                <UserX className="h-4 w-4 text-destructive" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bike className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No riders found matching your filters</p>
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {total > pagination.pageSize && (
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.pageSize + 1}-
              {Math.min(pagination.page * pagination.pageSize, total)} of {total} riders
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
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
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: prev.page + 1,
                  }))
                }
                disabled={pagination.page * pagination.pageSize >= total}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Rider Detail Dialog */}
      {isDetailDialogOpen && selectedRider && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bike className="h-6 w-6" />
                  Rider Details
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Comprehensive rider profile and application details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rider Overview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded">
                      {selectedRider.profile?.fullName || selectedRider.user.name || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded">
                      {selectedRider.user.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded">
                      {selectedRider.user.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <Badge variant="outline" className="text-sm">
                      {selectedRider.user.role.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded">
                      {selectedRider.profile?.dateOfBirth
                        ? new Date(selectedRider.profile.dateOfBirth).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Nationality</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded">
                      {selectedRider.profile?.nationality || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Codice Fiscale</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded font-mono">
                      {selectedRider.profile?.codiceFiscale || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Place of Birth</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded">
                      {selectedRider.profile?.placeOfBirth || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Address Information */}
                <h3 className="text-lg font-semibold flex items-center gap-2 pt-4 border-t">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Residence Address</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded">
                      {selectedRider.profile?.residenceAddress || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Domicile Address</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded">
                      {selectedRider.profile?.domicileAddress || "Same as residence"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Desired Work City</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded">
                      {selectedRider.profile?.desiredWorkCity || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Region</Label>
                    <Badge variant="outline" className="text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedRider.region?.name || "Not assigned"}
                    </Badge>
                  </div>
                </div>

                {/* Vehicle & License Information */}
                <h3 className="text-lg font-semibold flex items-center gap-2 pt-4 border-t">
                  <Car className="h-5 w-5" />
                  Vehicle & License Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vehicle Type</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      {getVehicleIcon(selectedRider.profile?.vehicleType)({
                        className: "h-5 w-5",
                      })}
                      <span>
                        {selectedRider.profile?.vehicleType
                          ? selectedRider.profile.vehicleType.replace(/(^|\s)\w/g, (l) =>
                              l.toUpperCase()
                            )
                          : "Not provided"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vehicle Plate</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded font-mono">
                      {selectedRider.profile?.vehiclePlate || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vehicle Color</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded">
                      {selectedRider.profile?.vehicleColor || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">License Number</Label>
                    <p className="text-sm p-2 bg-muted/50 rounded font-mono">
                      {selectedRider.profile?.licenseNumber || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Business Information */}
                {selectedRider.profile?.hasBusiness && (
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Has Business</Label>
                        <Badge variant="default" className="text-sm">
                          {selectedRider.profile.hasBusiness ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">VAT ID</Label>
                        <p className="text-sm p-2 bg-muted/50 rounded font-mono">
                          {selectedRider.profile?.vatId || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legal Information */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Legal & Immigration Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Has Permesso di Soggiorno
                      </Label>
                      <Badge
                        variant={
                          selectedRider.profile?.hasPermessoDiSoggiorno
                            ? "default"
                            : "outline"
                        }
                        className="text-sm"
                      >
                        {selectedRider.profile?.hasPermessoDiSoggiorno ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Application Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Approval Status</Label>
                      <Badge
                        className={cn(
                          "text-sm",
                          statusColors[selectedRider.profile?.approvalStatus || RiderApprovalStatus.PENDING]
                        )}
                      >
                        {statusBadges[selectedRider.profile?.approvalStatus || RiderApprovalStatus.PENDING]?.icon({
                          className: "h-3 w-3 mr-1",
                        })}
                        {(selectedRider.profile?.approvalStatus || RiderApprovalStatus.PENDING).replace(
                          /_/g,
                          " "
                        )}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {selectedRider.profile?.approvalStatus === RiderApprovalStatus.APPROVED
                          ? "Approved By"
                          : selectedRider.profile?.approvalStatus === RiderApprovalStatus.REJECTED
                          ? "Rejected By"
                          : "Pending Review"}
                      </Label>
                      {selectedRider.profile?.approvedById ? (
                        <p className="text-sm p-2 bg-muted/50 rounded">
                          Admin ID: {selectedRider.profile.approvedById.slice(0, 8)}...
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Awaiting admin review
                        </p>
                      )}
                    </div>
                    {selectedRider.profile?.approvedAt && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Decision Date</Label>
                        <p className="text-sm p-2 bg-muted/50 rounded">
                          {new Date(selectedRider.profile.approvedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedRider.profile?.rejectionReason && (
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-medium text-red-600">
                          Rejection Reason
                        </Label>
                        <p className="text-sm p-2 bg-red-50 rounded text-red-700">
                          {selectedRider.profile.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rider Stats */}
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Rider Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <Star className="h-5 w-5 mx-auto text-yellow-500" />
                      <p className="text-2xl font-bold">{selectedRider.profile?.rating || 0}</p>
                      <p className="text-xs text-muted-foreground">Average Rating</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <ShoppingBag className="h-5 w-5 mx-auto" />
                      <p className="text-2xl font-bold">{selectedRider.orders?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <Users className="h-5 w-5 mx-auto" />
                      <p className="text-2xl font-bold">
                        {selectedRider.profile?.totalRatings || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Total Ratings</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <Bike className="h-5 w-5 mx-auto" />
                      <p className="text-2xl font-bold">
                        {selectedRider.isAvailable ? "Yes" : "No"}
                      </p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                    Close
                  </Button>
                  {selectedRider.profile?.approvalStatus === RiderApprovalStatus.PENDING && (
                    <>
                      <Button
                        className="bg-green-600"
                        onClick={() => {
                          setIsDetailDialogOpen(false)
                          setIsApproveDialogOpen(true)
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setIsDetailDialogOpen(false)
                          setIsRejectDialogOpen(true)
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Approve Rider Dialog */}
      {isApproveDialogOpen && selectedRider && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Approve Rider Application
              </CardTitle>
              <CardDescription>
                Review and approve rider: {selectedRider.profile?.fullName || selectedRider.user.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Admin Notes (Optional)</Label>
                <Input
                  placeholder="Add any notes about this approval..."
                  value={approveForm.notes}
                  onChange={(e) =>
                    setApproveForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Background Check Status</Label>
                <Select
                  value={approveForm.backgroundCheckStatus}
                  onValueChange={(v) =>
                    setApproveForm((prev) => ({ ...prev, backgroundCheckStatus: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETED">Completed - All checks passed</SelectItem>
                    <SelectItem value="PENDING">Pending - Awaiting verification</SelectItem>
                    <SelectItem value="CONDITIONAL">
                      Conditional - Approved with conditions
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Confirmation</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      By approving this rider, you confirm that all required documentation has been verified and the applicant meets all platform requirements for riders.
                    </p>
                    <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                      <li>Valid driver&apos;s license</li>
                      <li>Appropriate vehicle for delivery</li>
                      <li>Clean background check</li>
                      <li>Valid work authorization</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsApproveDialogOpen(false)
                    setApproveForm({ notes: "", backgroundCheckStatus: "COMPLETED" })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Rider
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Rider Dialog */}
      {isRejectDialogOpen && selectedRider && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-6 w-6" />
                Reject Rider Application
              </CardTitle>
              <CardDescription>
                Provide a reason for rejecting: {selectedRider.profile?.fullName || selectedRider.user.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rejection Reason *</Label>
                <textarea
                  className="w-full p-2 border rounded-md text-sm min-h-[100px]"
                  placeholder="Please provide a clear and professional reason for rejection. This will be communicated to the applicant."
                  value={rejectForm.reason}
                  onChange={(e) =>
                    setRejectForm((prev) => ({ ...prev, reason: e.target.value }))
                  }
                />
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Important</h4>
                    <p className="text-sm text-red-700 mt-1">
                      The rejection reason will be sent to the applicant via email and notification. Please be professional and specific about the reason for rejection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRejectDialogOpen(false)
                    setRejectForm({ reason: "" })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={actionLoading || !rejectForm.reason.trim()}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Rider
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
