export enum UserRole {
  PRIVATE = 'PRIVATE',
  RIDER = 'RIDER',
  BUSINESS = 'BUSINESS',
  DEVELOPER = 'DEVELOPER',
  SYSTEM_OPERATOR = 'SYSTEM_OPERATOR',
  CUSTOMER_CARE = 'CUSTOMER_CARE',
  REGIONAL_OPERATOR = 'REGIONAL_OPERATOR',
  LOCAL_RIDER_MONITOR = 'LOCAL_RIDER_MONITOR'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  businessId?: string;
  riderId?: string;
  items: any;
  total: number;
  status: OrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rider {
  id: string;
  userId: string;
  isAvailable: boolean;
  regionId: string;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  description?: string;
  address: string;
  regionId: string;
  products: Product[];
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
}

export interface Region {
  id: string;
  name: string;
  boundaries: any;
}

export interface RiderShift {
  id: string;
  riderId: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
}