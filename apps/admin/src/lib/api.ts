import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If 401 error and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Try to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  loginWithGoogle: (code: string, redirectUri: string) =>
    api.post('/auth/google/exchange', { code, redirectUri }),
  
  getGoogleAuthUrl: (redirectUri: string) =>
    api.get('/auth/google/url', { params: { redirect_uri: redirectUri } }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getMe: () =>
    api.get('/auth/me'),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

// User API
export const userApi = {
  getAll: (params?: { role?: string; search?: string; limit?: number; offset?: number }) =>
    api.get('/users', { params }),
  
  getById: (id: string) =>
    api.get(`/users/${id}`),
  
  create: (data: any) =>
    api.post('/users', data),
  
  update: (id: string, data: any) =>
    api.patch(`/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
  
  deactivate: (id: string) =>
    api.post(`/users/${id}/deactivate`),
  
  activate: (id: string) =>
    api.post(`/users/${id}/activate`),
  
  updateRole: (id: string, role: string) =>
    api.post(`/users/${id}/role`, { role }),
};

// Business API
export const businessApi = {
  getAll: (params?: { status?: string; regionId?: string; search?: string; limit?: number; offset?: number }) =>
    api.get('/businesses', { params }),
  
  getById: (id: string) =>
    api.get(`/businesses/${id}`),
  
  getByUserId: (userId: string) =>
    api.get(`/businesses/user/${userId}`),
  
  update: (id: string, data: any) =>
    api.patch(`/businesses/${id}`, data),
  
  verify: (id: string) =>
    api.post(`/businesses/${id}/verify`),
  
  unverify: (id: string) =>
    api.post(`/businesses/${id}/unverify`),
  
  suspend: (id: string, reason?: string) =>
    api.post(`/businesses/${id}/suspend`, { reason }),
  
  activate: (id: string) =>
    api.post(`/businesses/${id}/activate`),
};

// Rider API
export const riderApi = {
  getAll: (params?: { approvalStatus?: string; regionId?: string; isAvailable?: boolean; search?: string; limit?: number; offset?: number }) =>
    api.get('/riders', { params }),
  
  getAvailable: (params?: { regionId?: string; limit?: number; offset?: number }) =>
    api.get('/riders/available', { params }),
  
  getById: (id: string) =>
    api.get(`/riders/${id}`),
  
  getByUserId: (userId: string) =>
    api.get(`/riders/user/${userId}`),
  
  getProfile: (riderId: string) =>
    api.get(`/riders/${riderId}/profile`),
  
  updateProfile: (riderId: string, data: any) =>
    api.patch(`/riders/${riderId}/profile`, data),
  
  approve: (riderId: string, notes?: string) =>
    api.post(`/riders/${riderId}/approve`, { notes }),
  
  reject: (riderId: string, reason: string) =>
    api.post(`/riders/${riderId}/reject`, { reason }),
  
  updateAvailability: (riderId: string, isAvailable: boolean) =>
    api.patch(`/riders/${riderId}/availability`, { isAvailable }),
  
  getStatistics: () =>
    api.get('/riders/statistics'),
};

// Order API
export const orderApi = {
  getAll: (params?: { status?: string; userId?: string; businessId?: string; riderId?: string; limit?: number; offset?: number }) =>
    api.get('/orders', { params }),
  
  getById: (id: string) =>
    api.get(`/orders/${id}`),
  
  create: (data: any) =>
    api.post('/orders', data),
  
  update: (id: string, data: any) =>
    api.patch(`/orders/${id}`, data),
  
  assignRider: (orderId: string, riderId: string) =>
    api.post(`/orders/${orderId}/assign-rider`, { riderId }),
  
  updateStatus: (orderId: string, status: string) =>
    api.patch(`/orders/${orderId}/status`, { status }),
  
  getUserOrders: (userId: string) =>
    api.get(`/orders/user/${userId}`),
  
  getBusinessOrders: (businessId: string) =>
    api.get(`/orders/business/${businessId}`),
  
  getRiderOrders: (riderId: string) =>
    api.get(`/orders/rider/${riderId}`),
  
  rate: (orderId: string, ratings: { userRating?: number; riderRating?: number; businessRating?: number; review?: string }) =>
    api.post(`/orders/${orderId}/rate`, ratings),
};

// Region API
export const regionApi = {
  getAll: () =>
    api.get('/regions'),
  
  getById: (id: string) =>
    api.get(`/regions/${id}`),
  
  create: (data: any) =>
    api.post('/regions', data),
  
  update: (id: string, data: any) =>
    api.patch(`/regions/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/regions/${id}`),
  
  deactivate: (id: string) =>
    api.post(`/regions/${id}/deactivate`),
  
  activate: (id: string) =>
    api.post(`/regions/${id}/activate`),
};

// Notification API
export const notificationApi = {
  getAll: (params?: { userId?: string; isRead?: boolean; limit?: number; offset?: number }) =>
    api.get('/notifications', { params }),
  
  getById: (id: string) =>
    api.get(`/notifications/${id}`),
  
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.post('/notifications/mark-all-read'),
  
  delete: (id: string) =>
    api.delete(`/notifications/${id}`),
  
  create: (data: any) =>
    api.post('/notifications', data),
  
  broadcast: (data: { title: string; message: string; type: string; role?: string; regionId?: string }) =>
    api.post('/notifications/broadcast', data),
};

// Chatbot/API for direct personnel addition
export const adminApi = {
  // Add internal personnel (no registration needed)
  addPersonnel: (data: { email: string; name: string; role: string; phone?: string; password?: string }) =>
    api.post('/admin/personnel', data),
  
  // Emergency controls
  setMaintenanceMode: (enabled: boolean, message?: string) =>
    api.post('/admin/maintenance', { enabled, message }),
  
  broadcastAlert: (data: { title: string; message: string; severity: 'low' | 'medium' | 'high' | 'critical' }) =>
    api.post('/admin/broadcast-alert', data),
  
  getSystemStatus: () =>
    api.get('/admin/system-status'),
  
  getStats: () =>
    api.get('/admin/stats'),
};

// Settings API
export const settingsApi = {
  getAll: () =>
    api.get('/settings'),
  
  update: (key: string, value: any) =>
    api.patch(`/settings/${key}`, { value }),
  
  updateMultiple: (settings: Record<string, any>) =>
    api.patch('/settings', { settings }),
};

export default api;
