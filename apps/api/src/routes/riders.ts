import express from 'express';
import { prisma } from '@recap/database';

import { getCurrentUser, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Get all available riders (filterable by region)
router.get('/available', async (req, res) => {
  try {
    const { regionId, limit, offset } = req.query;
    
    const where: any = {
      isAvailable: true,
      profile: { approvalStatus: 'APPROVED' },
    };
    
    if (regionId) {
      where.regionId = regionId as string;
    }
    
    const riders = await prisma.rider.findMany({
      where,
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            phone: true,
            avatar: true,
            googleImage: true,
            role: true,
          },
        },
        profile: true,
        currentShift: true,
        region: {
          select: { id: true, name: true, code: true },
        },
      },
      take: limit ? parseInt(limit as string) : 100,
      skip: offset ? parseInt(offset as string) : 0,
    });
    
    const total = await prisma.rider.count({ where });
    
    res.json({ riders, total });
  } catch (error: any) {
    console.error('Get available riders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all riders (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { regionId, approvalStatus, isAvailable, search, limit, offset } = req.query;
    
    const where: any = {};
    
    if (regionId) {
      where.regionId = regionId as string;
    }
    
    if (approvalStatus) {
      where.profile = { approvalStatus: approvalStatus as string };
    }
    
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }
    
    // Search by rider name or email
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ],
      };
    }
    
    const riders = await prisma.rider.findMany({
      where,
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            phone: true,
            avatar: true,
            googleImage: true,
            role: true,
            createdAt: true,
          },
        },
        profile: true,
        currentShift: true,
        region: {
          select: { id: true, name: true, code: true },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
      skip: offset ? parseInt(offset as string) : 0,
    });
    
    const total = await prisma.rider.count({ where });
    
    res.json({ riders, total });
  } catch (error: any) {
    console.error('Get all riders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get rider by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = getCurrentUser(req);
    
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            phone: true,
            avatar: true,
            googleImage: true,
            role: true,
            createdAt: true,
          },
        },
        profile: true,
        currentShift: true,
        region: {
          select: { id: true, name: true, code: true, boundaries: true },
        },
        shifts: {
          orderBy: { startTime: 'desc' },
          take: 10,
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { name: true, phone: true } },
            business: { select: { name: true } },
          },
        },
      },
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    // Check permission (unless admin)
    const isAdmin = [
      'SYSTEM_OPERATOR',
      'DEVELOPER',
      'CUSTOMER_CARE',
      'REGIONAL_OPERATOR',
      'LOCAL_RIDER_MONITOR'
    ].includes(user.role);
    
    if (!isAdmin && user.id !== rider.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(rider);
  } catch (error: any) {
    console.error('Get rider error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create rider (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { userId, regionId, isAvailable } = req.body;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if rider already exists
    const existingRider = await prisma.rider.findUnique({
      where: { userId },
    });
    
    if (existingRider) {
      return res.status(400).json({ error: 'User is already a rider' });
    }
    
    // Get default region if not provided
    const defaultRegion = await prisma.region.findFirst();
    
    // Create rider
    const rider = await prisma.rider.create({
      data: {
        userId,
        regionId: regionId || defaultRegion?.id,
        isAvailable: isAvailable || false,
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true,
            role: true,
          },
        },
        region: {
          select: { id: true, name: true, code: true },
        },
      },
    });
    
    // Create rider profile
    await prisma.riderProfile.create({
      data: {
        userId,
        regionId: regionId || defaultRegion?.id,
        isAvailable: isAvailable || false,
        approvalStatus: 'PENDING',
        backgroundCheckStatus: 'PENDING',
      },
    });
    
    res.status(201).json(rider);
  } catch (error: any) {
    console.error('Create rider error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update rider
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable, regionId } = req.body;
    const user = getCurrentUser(req);
    
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: { user: true, profile: true },
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    // Check permission
    const isAdmin = [
      'SYSTEM_OPERATOR',
      'DEVELOPER',
      'CUSTOMER_CARE',
      'REGIONAL_OPERATOR',
      'LOCAL_RIDER_MONITOR'
    ].includes(user.role);
    
    if (!isAdmin && user.id !== rider.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update rider
    const updatedRider = await prisma.rider.update({
      where: { id },
      data: {
        isAvailable: isAvailable !== undefined ? isAvailable : rider.isAvailable,
        regionId: regionId || rider.regionId,
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true,
            role: true,
          },
        },
        profile: true,
        region: {
          select: { id: true, name: true, code: true },
        },
      },
    });
    
    // Update profile region too
    if (regionId) {
      await prisma.riderProfile.updateMany({
        where: { userId: rider.userId },
        data: { regionId },
      });
    }
    
    res.json(updatedRider);
  } catch (error: any) {
    console.error('Update rider error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update rider availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const user = getCurrentUser(req);
    
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: { user: true },
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    if (user.id !== rider.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const updatedRider = await prisma.rider.update({
      where: { id },
      data: { isAvailable },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true,
          },
        },
        profile: true,
      },
    });
    
    // Update profile too
    await prisma.riderProfile.updateMany({
      where: { userId: rider.userId },
      data: { isAvailable },
    });
    
    res.json(updatedRider);
  } catch (error: any) {
    console.error('Update rider availability error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update rider location (for real-time tracking)
router.patch('/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    const user = getCurrentUser(req);
    
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: { user: true, profile: true },
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    if (user.id !== rider.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update rider profile with latest location
    await prisma.riderProfile.updateMany({
      where: { userId: rider.userId },
      data: {
        // Store location as JSON for now
        // In production, use a proper location tracking system
      },
    });
    
    // Broadcast location to all orders this rider is assigned to
    const orders = await prisma.order.findMany({
      where: { riderId: id },
      select: { id: true },
    });
    
    orders.forEach(order => {
      (req as any).io?.to(order.id).emit('rider-location-update', {
        riderId: id,
        lat,
        lng,
        timestamp: new Date().toISOString(),
      });
    });
    
    res.json({ success: true, lat, lng });
  } catch (error: any) {
    console.error('Update rider location error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve rider (admin only)
router.post('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const admin = getCurrentUser(req);
    
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: { user: true, profile: true },
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    if (!rider.profile) {
      return res.status(400).json({ error: 'Rider profile not found' });
    }
    
    // Update profile
    const updatedProfile = await prisma.riderProfile.update({
      where: { userId: rider.userId },
      data: {
        approvalStatus: 'APPROVED',
        approvedById: admin.id,
        approvedAt: new Date(),
        backgroundCheckNotes: notes,
      },
    });
    
    // Update rider
    await prisma.rider.update({
      where: { id },
      data: { isAvailable: true },
    });
    
    // Notify rider
    await prisma.notification.create({
      data: {
        userId: rider.userId,
        title: 'Rider Application Approved',
        message: 'Your rider application has been approved! You can now start accepting orders.',
        type: 'approval',
        data: { riderId: id, approvedBy: admin.id },
      },
    });
    
    res.json({ 
      success: true, 
      message: 'Rider approved successfully',
      profile: updatedProfile
    });
  } catch (error: any) {
    console.error('Approve rider error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject rider (admin only)
router.post('/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const admin = getCurrentUser(req);
    
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: { user: true, profile: true },
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    if (!rider.profile) {
      return res.status(400).json({ error: 'Rider profile not found' });
    }
    
    // Update profile
    await prisma.riderProfile.update({
      where: { userId: rider.userId },
      data: {
        approvalStatus: 'REJECTED',
        approvedById: admin.id,
        approvedAt: new Date(),
        rejectionReason: reason,
      },
    });
    
    // Update rider
    await prisma.rider.update({
      where: { id },
      data: { isAvailable: false },
    });
    
    // Notify rider
    await prisma.notification.create({
      data: {
        userId: rider.userId,
        title: 'Rider Application Rejected',
        message: `Your rider application has been rejected. Reason: ${reason || 'Not specified'}`,
        type: 'approval',
        data: { riderId: id, rejectedBy: admin.id, reason },
      },
    });
    
    res.json({ 
      success: true, 
      message: 'Rider rejected successfully'
    });
  } catch (error: any) {
    console.error('Reject rider error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get rider profile
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const user = getCurrentUser(req);
    
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: { user: true, profile: true },
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    // Check permission
    const isAdmin = [
      'SYSTEM_OPERATOR',
      'DEVELOPER',
      'CUSTOMER_CARE',
      'REGIONAL_OPERATOR',
      'LOCAL_RIDER_MONITOR'
    ].includes(user.role);
    
    if (!isAdmin && user.id !== rider.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const profile = await prisma.riderProfile.findUnique({
      where: { userId: rider.userId },
      include: {
        region: {
          select: { id: true, name: true, code: true },
        },
      },
    });
    
    res.json({ rider, profile });
  } catch (error: any) {
    console.error('Get rider profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update rider profile
router.patch('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      licenseNumber, 
      licenseImage, 
      vehicleType, 
      vehiclePlate, 
      vehicleColor,
      backgroundCheckNotes 
    } = req.body;
    const user = getCurrentUser(req);
    
    const rider = await prisma.rider.findUnique({
      where: { id },
      include: { user: true, profile: true },
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    if (!rider.profile) {
      return res.status(400).json({ error: 'Rider profile not found' });
    }
    
    // Check permission
    const isAdmin = [
      'SYSTEM_OPERATOR',
      'DEVELOPER',
      'CUSTOMER_CARE',
      'REGIONAL_OPERATOR',
      'LOCAL_RIDER_MONITOR'
    ].includes(user.role);
    
    if (!isAdmin && user.id !== rider.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const updatedProfile = await prisma.riderProfile.update({
      where: { userId: rider.userId },
      data: {
        licenseNumber,
        licenseImage,
        vehicleType,
        vehiclePlate,
        vehicleColor,
        backgroundCheckNotes,
      },
    });
    
    res.json(updatedProfile);
  } catch (error: any) {
    console.error('Update rider profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get rider statistics
router.get('/statistics', async (req, res) => {
  try {
    const { regionId } = req.query;
    
    const where: any = {};
    if (regionId) {
      where.regionId = regionId as string;
    }
    
    const totalRiders = await prisma.rider.count({ where });
    const availableRiders = await prisma.rider.count({ 
      where: { ...where, isAvailable: true } 
    });
    const totalOrders = await prisma.order.count({ 
      where: { riderId: { not: null } } 
    });
    
    const pendingRiders = await prisma.riderProfile.count({ 
      where: { 
        ...(regionId ? { regionId: regionId as string } : {}),
        approvalStatus: 'PENDING' 
      } 
    });
    const approvedRiders = await prisma.riderProfile.count({ 
      where: { 
        ...(regionId ? { regionId: regionId as string } : {}),
        approvalStatus: 'APPROVED' 
      } 
    });
    const rejectedRiders = await prisma.riderProfile.count({ 
      where: { 
        ...(regionId ? { regionId: regionId as string } : {}),
        approvalStatus: 'REJECTED' 
      } 
    });
    
    res.json({
      totalRiders,
      availableRiders,
      totalOrders,
      pendingRiders,
      approvedRiders,
      rejectedRiders,
    });
  } catch (error: any) {
    console.error('Get rider statistics error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
