import express from 'express';
import { prisma } from '@recap/database';

import { requireAdmin, getCurrentUser } from '../middleware/auth';
import { hashPassword } from '../utils/auth';
import { io } from '../index';

const router = express.Router();

// Add personnel (internal roles only - bypasses registration)
router.post('/personnel', requireAdmin, async (req, res) => {
  try {
    const { email, name, role, phone, password, regionId } = req.body;
    const admin = getCurrentUser(req);
    
    // Validate required fields
    if (!email || !name || !role) {
      return res.status(400).json({ 
        error: 'Email, name, and role are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    // Define internal roles that can be added directly
    const internalRoles = [
      'SYSTEM_OPERATOR',
      'DEVELOPER',
      'CUSTOMER_CARE',
      'REGIONAL_OPERATOR',
      'LOCAL_RIDER_MONITOR',
    ];
    
    // Check if role is valid
    const userRole = role as string;
    if (!['SYSTEM_OPERATOR', 'DEVELOPER', 'CUSTOMER_CARE', 'REGIONAL_OPERATOR', 'LOCAL_RIDER_MONITOR', 'RIDER', 'BUSINESS', 'PRIVATE'].includes(userRole)) {
      return res.status(400).json({ 
        error: 'Invalid role' 
      });
    }
    
    // Hash password if provided
    const hashedPassword = password ? await hashPassword(password) : null;
    
    // Get default region if not provided
    const defaultRegion = await prisma.region.findFirst();
    
    // Create user transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: userRole,
          phone,
          emailVerified: true, // Direct add users are verified
          isActive: true,
        },
      });
      
      // If creating a RIDER, also create rider profile and rider record
      if (userRole === 'RIDER') {
        await tx.riderProfile.create({
          data: {
            userId: user.id,
            regionId: regionId || defaultRegion?.id,
            approvalStatus: 'APPROVED', // Auto-approved for direct add
            backgroundCheckStatus: 'COMPLETED',
            isAvailable: false,
            approvedById: admin.id,
            approvedAt: new Date(),
          },
        });
        
        await tx.rider.create({
          data: {
            userId: user.id,
            regionId: regionId || defaultRegion?.id,
            isAvailable: false,
          },
        });
      }
      
      // If creating a BUSINESS, also create business profile and business record
      if (userRole === 'BUSINESS') {
        await tx.businessProfile.create({
          data: {
            userId: user.id,
            name: name,
            address: '',
            regionId: regionId || defaultRegion?.id,
            status: 'ACTIVE',
            approvedAt: new Date(),
            isVerified: true,
          },
        });
        
        await tx.business.create({
          data: {
            userId: user.id,
            name: name,
            address: '',
            regionId: regionId || defaultRegion?.id,
          },
        });
      }
      
      return user;
    });
    
    // Log the action
    console.log(`Admin ${admin.id} added personnel: ${name} (${role})`);
    
    // Broadcast to other admins
    io.emit('admin-action', {
      type: 'personnel-added',
      adminId: admin.id,
      user: result,
    });
    
    res.status(201).json({
      success: true,
      user: result,
      message: `Successfully added ${name} as ${role.replace(/_/g, ' ')}`,
    });
  } catch (error: any) {
    console.error('Add personnel error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set maintenance mode
router.post('/maintenance', requireAdmin, async (req, res) => {
  try {
    const { enabled, message } = req.body;
    const admin = getCurrentUser(req);
    
    // In production, this would update a system setting in the database
    // For now, we'll just broadcast it via Socket.io
    
    const maintenanceMode = {
      enabled: enabled || false,
      message: message || 'System under maintenance',
      startedAt: new Date(),
      startedBy: admin.id,
    };
    
    // Broadcast to all connected clients
    io.emit('maintenance-mode', maintenanceMode);
    
    console.log(`Maintenance mode ${enabled ? 'enabled' : 'disabled'} by admin ${admin.id}`);
    
    res.json({
      success: true,
      maintenanceMode,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
    });
  } catch (error: any) {
    console.error('Set maintenance mode error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Broadcast system alert
router.post('/broadcast-alert', requireAdmin, async (req, res) => {
  try {
    const { title, message, severity } = req.body;
    const admin = getCurrentUser(req);
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    const alert = {
      id: Date.now().toString(),
      title,
      message,
      severity: severity || 'high',
      createdAt: new Date(),
      createdBy: admin.id,
      createdByName: admin.name,
    };
    
    // Broadcast to all connected clients
    io.emit('system-alert', alert);
    
    // Also create notifications for all users
    const users = await prisma.user.findMany({
      select: { id: true },
    });
    
    await prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        title: `[SYSTEM ALERT] ${title}`,
        message,
        type: 'system',
        data: { alertId: alert.id, severity },
      })),
    });
    
    console.log(`System alert broadcast by admin ${admin.id}: ${title}`);
    
    res.json({
      success: true,
      alert,
      message: 'System alert broadcast to all users',
    });
  } catch (error: any) {
    console.error('Broadcast alert error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get system status
router.get('/system-status', requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalBusinesses,
      totalRiders,
      totalOrders,
      activeOrders,
      pendingRiders,
      activeRegions,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.business.count({ where: { isActive: true } }),
      prisma.rider.count({ where: { isAvailable: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { not: ['DELIVERED', 'CANCELLED'] } } }),
      prisma.riderProfile.count({ where: { approvalStatus: 'PENDING' } }),
      prisma.region.count({ where: { isActive: true } }),
    ]);
    
    const systemStatus = {
      totalUsers,
      totalBusinesses,
      totalRiders,
      totalOrders,
      activeOrders,
      pendingRiders,
      activeRegions,
      uptime: process.uptime(),
      timestamp: new Date(),
    };
    
    res.json(systemStatus);
  } catch (error: any) {
    console.error('Get system status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get comprehensive stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // User stats
    const totalUsers = await prisma.user.count({ where: { isActive: true } });
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
      where: { isActive: true },
    });
    
    const roleStats: Record<string, number> = {};
    usersByRole.forEach(stat => {
      roleStats[stat.role] = stat._count._all;
    });
    
    // Business stats
    const totalBusinesses = await prisma.business.count({ where: { isActive: true } });
    const verifiedBusinesses = await prisma.businessProfile.count({ 
      where: { isVerified: true } 
    });
    const pendingBusinesses = await prisma.businessProfile.count({ 
      where: { status: 'PENDING' } 
    });
    
    // Rider stats
    const totalRiders = await prisma.rider.count();
    const availableRiders = await prisma.rider.count({ where: { isAvailable: true } });
    const pendingRiders = await prisma.riderProfile.count({ 
      where: { approvalStatus: 'PENDING' } 
    });
    const approvedRiders = await prisma.riderProfile.count({ 
      where: { approvalStatus: 'APPROVED' } 
    });
    
    // Order stats
    const totalOrders = await prisma.order.count();
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    
    const statusStats: Record<string, number> = {};
    ordersByStatus.forEach(stat => {
      statusStats[stat.status] = stat._count._all;
    });
    
    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: today } },
    });
    
    // This week's orders
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekOrders = await prisma.order.count({
      where: { createdAt: { gte: weekAgo } },
    });
    
    // This month's orders
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthOrders = await prisma.order.count({
      where: { createdAt: { gte: monthAgo } },
    });
    
    // Region stats
    const totalRegions = await prisma.region.count({ where: { isActive: true } });
    
    res.json({
      users: {
        total: totalUsers,
        byRole: roleStats,
      },
      businesses: {
        total: totalBusinesses,
        verified: verifiedBusinesses,
        pending: pendingBusinesses,
      },
      riders: {
        total: totalRiders,
        available: availableRiders,
        pending: pendingRiders,
        approved: approvedRiders,
      },
      orders: {
        total: totalOrders,
        byStatus: statusStats,
        today: todayOrders,
        thisWeek: weekOrders,
        thisMonth: monthOrders,
      },
      regions: {
        total: totalRegions,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create region
router.post('/regions', requireAdmin, async (req, res) => {
  try {
    const { name, code, boundaries, center } = req.body;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }
    
    // Check if code already exists
    const existingRegion = await prisma.region.findUnique({
      where: { code },
    });
    
    if (existingRegion) {
      return res.status(400).json({ error: 'Region with this code already exists' });
    }
    
    const region = await prisma.region.create({
      data: {
        name,
        code,
        boundaries,
        center,
        isActive: true,
      },
    });
    
    res.status(201).json(region);
  } catch (error: any) {
    console.error('Create region error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all regions
router.get('/regions', async (req, res) => {
  try {
    const regions = await prisma.region.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    
    res.json(regions);
  } catch (error: any) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
