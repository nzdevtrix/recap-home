// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  phone?: string | null;
  avatar?: string | null;
  googleImage?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  googleId?: string | null;
}

export type UserRole = 
  | 'PRIVATE'
  | 'RIDER'
  | 'BUSINESS'
  | 'DEVELOPER'
  | 'SYSTEM_OPERATOR'
  | 'CUSTOMER_CARE'
  | 'REGIONAL_OPERATOR'
  | 'LOCAL_RIDER_MONITOR';

export interface AuthUser extends User {
  accessToken?: string;
  refreshToken?: string;
}

// Rider Types
export type RiderApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BusinessStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export interface RiderProfile {
  id: string;
  userId: string;
  licenseNumber?: string | null;
  licenseImage?: string | null;
  vehicleType?: string | null;
  vehiclePlate?: string | null;
  vehicleColor?: string | null;
  backgroundCheckStatus: string;
  backgroundCheckNotes?: string | null;
  approvalStatus: RiderApprovalStatus;
  approvedById?: string | null;
  approvedBy?: User | null;
  approvedAt?: Date | null;
  rejectionReason?: string | null;
  regionId: string;
  region?: Region;
  isAvailable: boolean;
  currentShiftId?: string | null;
  currentShift?: RiderShift;
  rating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rider {
  id: string;
  userId: string;
  user: User;
  profile?: RiderProfile;
  isAvailable: boolean;
  currentShiftId?: string | null;
  currentShift?: RiderShift;
  regionId: string;
  region?: Region;
  shifts: RiderShift[];
  orders: Order[];
}

// Business Types
export interface BusinessProfile {
  id: string;
  userId: string;
  user: User;
  name: string;
  description?: string | null;
  address: string;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  phone?: string | null;
  website?: string | null;
  category?: string | null;
  subCategory?: string | null;
  status: BusinessStatus;
  isVerified: boolean;
  verificationDocs?: string | null;
  isOpen: boolean;
  openingHours?: string | null;
  rating: number;
  totalRatings: number;
  regionId: string;
  region?: Region;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  products: Product[];
  orders: Order[];
}

export interface Business {
  id: string;
  userId: string;
  user: User;
  profile?: BusinessProfile;
  name: string;
  description?: string | null;
  address: string;
  regionId: string;
  region?: Region;
  products: Product[];
  orders: Order[];
}

// Order Types
export type OrderStatus = 
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  businessId?: string | null;
  business?: Business | null;
  riderId?: string | null;
  rider?: Rider | null;
  items: any[];
  total: number;
  deliveryFee: number;
  grandTotal: number;
  status: OrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryNotes?: string | null;
  paymentMethod?: string | null;
  paymentStatus: string;
  paymentId?: string | null;
  paymentAmount?: number | null;
  createdAt: Date;
  updatedAt: Date;
  pickedUpAt?: Date | null;
  deliveredAt?: Date | null;
  userRating?: number | null;
  riderRating?: number | null;
  businessRating?: number | null;
}

// Product Types
export interface Product {
  id: string;
  businessId: string;
  business?: Business;
  name: string;
  description?: string | null;
  price: number;
  category: string;
  subCategory?: string | null;
  imageUrl?: string | null;
  images?: any | null;
  isAvailable: boolean;
  stock?: number | null;
  options?: any | null;
  tags?: any | null;
  rating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

// Region Types
export interface Region {
  id: string;
  name: string;
  code: string;
  boundaries: any;
  center?: any | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  riders?: Rider[];
  businesses?: Business[];
}

// Rider Shift Types
export interface RiderShift {
  id: string;
  riderId: string;
  rider?: Rider;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  user?: User;
  title: string;
  message: string;
  type: string;
  data?: any | null;
  isRead: boolean;
  isSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  receiverId?: string | null;
  receiver?: User | null;
  message: string;
  isAi: boolean;
  orderId?: string | null;
  role?: string | null;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  user?: User;
  orderId?: string | null;
  order?: Order;
  isOpen: boolean;
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: ChatMessage[];
}

// Stats Types
export interface SystemStats {
  totalUsers: number;
  totalBusinesses: number;
  totalRiders: number;
  totalOrders: number;
  activeOrders: number;
  pendingRiders: number;
  verifiedBusinesses: number;
  activeRegions: number;
  revenueToday: number;
  revenueThisMonth: number;
  revenueThisYear: number;
}

export interface DashboardStats {
  users: {
    total: number;
    byRole: Record<UserRole, number>;
    active: number;
    inactive: number;
  };
  businesses: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    verified: number;
  };
  riders: {
    total: number;
    available: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  orders: {
    total: number;
    byStatus: Record<OrderStatus, number>;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  regions: {
    total: number;
    active: number;
  };
}

// Form Types
export interface RegisterUserForm {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  phone?: string;
  regionId?: string;
  businessName?: string;
  address?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegionForm {
  name: string;
  code: string;
  boundaries: any;
  center?: { lat: number; lng: number };
}

export interface RiderProfileForm {
  licenseNumber?: string;
  licenseImage?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  vehicleColor?: string;
  backgroundCheckNotes?: string;
}

export interface BusinessProfileForm {
  name: string;
  description?: string;
  address: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  website?: string;
  category?: string;
  subCategory?: string;
  openingHours?: string;
}

// Table Types
export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Filter Types
export interface UserFilters {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}

export interface BusinessFilters {
  status?: BusinessStatus;
  regionId?: string;
  search?: string;
  isVerified?: boolean;
}

export interface RiderFilters {
  approvalStatus?: RiderApprovalStatus;
  regionId?: string;
  isAvailable?: boolean;
  search?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  userId?: string;
  businessId?: string;
  riderId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Toast/Notification Types
export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Emergency Controls Types
export interface MaintenanceMode {
  enabled: boolean;
  message?: string;
  startedAt?: Date;
  startedBy?: User;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  createdBy: User;
  isActive: boolean;
}

// Settings Types
export interface Setting {
  key: string;
  value: any;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

export interface Settings {
  [key: string]: Setting;
}

// Payment Types
export interface PaymentConfig {
  id: string;
  businessId: string;
  business?: Business;
  acceptsCreditCard: boolean;
  acceptsPayPal: boolean;
  acceptsSatispay: boolean;
  acceptsCash: boolean;
  stripePublishableKey?: string | null;
  stripeSecretKey?: string | null;
  stripeWebhookSecret?: string | null;
  paypalClientId?: string | null;
  paypalClientSecret?: string | null;
  paypalWebhookId?: string | null;
  satispayApiKey?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
