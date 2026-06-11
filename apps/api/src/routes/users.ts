import express from 'express';
import { prisma } from '@recap/database';

import { getCurrentUser, requireAdmin, authorize } from '../middleware/auth';
import { hashPassword } from '../utils/auth';

const router = express.Router();

// Get all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { role, search, isActive, limit, offset } = req.query;
    
    const where: any = {};
    
    if (role) {
      where.role = role as string;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const users = await prisma.user.findMany({
      where,
      include: {
        rider: {
          include: {
            profile: true,
            region: { select: { name: true, code: true } },
          },
        },
        business: {
          include: {
            profile: true,
            region: { select: { name: true, code: true } },
          },
        },
        riderProfile: true,
        businessProfile: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
      skip: offset ? parseInt(offset as string) : 0,
    });
    
    const total = await prisma.user.count({ where });
    
    res.json({ users, total });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = getCurrentUser(req);
    
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        rider: {
          include: {
            profile: true,
            region: { select: { name: true, code: true, boundaries: true } },
            shifts: {
              orderBy: { startTime: 'desc' },
              take: 10,
            },
          },
        },
        business: {
          include: {
            profile: true,
            region: { select: { name: true, code: true } },
            products: {
              take: 20,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        riderProfile: true,
        businessProfile: true,
        orders: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            business: { select: { name: true } },
            rider: { select: { user: { select: { name: true } } } },
          },
        },
      },
    });
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check permission (unless admin)
    const isAdmin = requireAdmin.length > 0; // Check if user is admin
    const adminRoles = [
      'SYSTEM_OPERATOR',
      'DEVELOPER',
      'CUSTOMER_CARE',
      'REGIONAL_OPERATOR',
      'LOCAL_RIDER_MONITOR'
    ];
    
    if (!adminRoles.includes(user.role) && user.id !== targetUser.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(targetUser);
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create user (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { email, password, name, role, phone, regionId } = req.body;
    
    // Validate
    if (!email || !name || !role) {
      return res.status(400).json({ error: 'Email, name, and role are required' });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Hash password if provided
    const hashedPassword = password ? await hashPassword(password) : null;
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as string,
        phone,
        emailVerified: true, // Direct add users are verified
      },
      include: {
        rider: true,
        business: true,
      },
    });
    
    // If creating a RIDER, also create rider profile and rider record
    if (role === 'RIDER') {
      const defaultRegion = await prisma.region.findFirst();
      
      await prisma.riderProfile.create({
        data: {
          userId: user.id,
          regionId: regionId || defaultRegion?.id,
          approvalStatus: 'PENDING',
          backgroundCheckStatus: 'PENDING',
          isAvailable: false,
        },
      });
      
      await prisma.rider.create({
        data: {
          userId: user.id,
          regionId: regionId || defaultRegion?.id,
          isAvailable: false,
        },
      });
    }
    
    // If creating a BUSINESS, also create business profile and business record
    if (role === 'BUSINESS') {
      const defaultRegion = await prisma.region.findFirst();
      
      await prisma.businessProfile.create({
        data: {
          userId: user.id,
          name: name,
          address: '',
          regionId: regionId || defaultRegion?.id,
          status: 'ACTIVE', // Auto-approved for direct add
          approvedAt: new Date(),
        },
      });
      
      await prisma.business.create({
        data: {
          userId: user.id,
          name: name,
          address: '',
          regionId: regionId || defaultRegion?.id,
        },
      });
    }
    
    res.status(201).json(user);
  } catch (error: any) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin or self)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    const user = getCurrentUser(req);
    
    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check permission
    const adminRoles = [
      'SYSTEM_OPERATOR',
      'DEVELOPER',
      'CUSTOMER_CARE',
      'REGIONAL_OPERATOR',
    ];
    
    if (user.id !== id && !adminRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if email is being changed to an existing email
    if (email && email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        email,
      },
      include: {
        rider: true,
        business: true,
      },
    });
    
    res.json(updatedUser);
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user role (admin only)
router.patch('/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Cannot change your own role to non-admin if you're the only admin
    const admin = getCurrentUser(req);
    if (admin.id === id) {
      // Check if there are other admins
      const otherAdmins = await prisma.user.count({
        where: {
          role: { in: ['SYSTEM_OPERATOR', 'DEVELOPER'] },
          id: { not: id },
        },
      });
      
      if (otherAdmins === 0 && !['SYSTEM_OPERATOR', 'DEVELOPER'].includes(role as string)) {
        return res.status(400).json({
          error: 'Cannot change your own role - you are the only administrator'
        });
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role as string },
      include: {
        rider: true,
        business: true,
      },
    });
    
    res.json(updatedUser);
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deactivate user (admin only)
router.patch('/:id/deactivate', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Cannot deactivate yourself
    const admin = getCurrentUser(req);
    if (admin.id === id) {
      return res.status(400).json({ error: 'Cannot deactivate yourself' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        rider: true,
        business: true,
      },
    });
    
    // Deactivate associated rider/business
    if (updatedUser.role === 'RIDER') {
      await prisma.rider.updateMany({
        where: { userId: id },
        data: { isAvailable: false },
      });
      
      await prisma.riderProfile.updateMany({
        where: { userId: id },
        data: { isAvailable: false },
      });
    }
    
    if (updatedUser.role === 'BUSINESS') {
      await prisma.business.updateMany({
        where: { userId: id },
        data: { isActive: false },
      });
      
      await prisma.businessProfile.updateMany({
        where: { userId: id },
        data: { status: 'DEACTIVATED' },
      });
    }
    
    res.json(updatedUser);
  } catch (error: any) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Activate user (admin only)
router.patch('/:id/activate', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        rider: true,
        business: true,
      },
    });
    
    // Activate associated rider/business
    if (updatedUser.role === 'RIDER') {
      await prisma.rider.updateMany({
        where: { userId: id },
        data: { isAvailable: false }, // Don't auto-activate, let them set availability
      });
      
      await prisma.riderProfile.updateMany({
        where: { userId: id },
        data: { isAvailable: false },
      });
    }
    
    if (updatedUser.role === 'BUSINESS') {
      await prisma.business.updateMany({
        where: { userId: id },
        data: { isActive: true },
      });
      
      await prisma.businessProfile.updateMany({
        where: { userId: id },
        data: { status: 'ACTIVE' },
      });
    }
    
    res.json(updatedUser);
  } catch (error: any) {
    console.error('Activate user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only - hard delete)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Cannot delete yourself
    const admin = getCurrentUser(req);
    if (admin.id === id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    
    // Delete user and all associated data
    await prisma.$transaction([
      prisma.order.deleteMany({ where: { userId: id } }),
      prisma.rider.deleteMany({ where: { userId: id } }),
      prisma.riderProfile.deleteMany({ where: { userId: id } }),
      prisma.business.deleteMany({ where: { userId: id } }),
      prisma.businessProfile.deleteMany({ where: { userId: id } }),
      prisma.product.deleteMany({ where: { business: { userId: id } } }),
      prisma.conversation.deleteMany({ where: { userId: id } }),
      prisma.chatMessage.deleteMany({ where: { senderId: id } }),
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.session.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);
    
    res.json({ success: true, message: 'User and all associated data deleted' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics
router.get('/statistics', requireAdmin, async (req, res) => {
  try {
    const total = await prisma.user.count();
    const active = await prisma.user.count({ where: { isActive: true } });
    const inactive = await prisma.user.count({ where: { isActive: false } });
    
    const byRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });
    
    const roleStats: Record<string, number> = {};
    byRole.forEach(stat => {
      roleStats[stat.role] = stat._count._all;
    });
    
    const verified = await prisma.user.count({ where: { emailVerified: true } });
    const unverified = await prisma.user.count({ where: { emailVerified: false } });
    
    res.json({
      total,
      active,
      inactive,
      byRole: roleStats,
      verified,
      unverified,
    });
  } catch (error: any) {
    console.error('Get user statistics error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
