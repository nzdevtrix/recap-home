import express from 'express';
import { prisma } from '@recap/database';

import { getCurrentUser } from '../middleware/auth';
import { io } from '../index';

const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
  try {
    const { items, pickupAddress, deliveryAddress, businessId, deliveryNotes, paymentMethod } = req.body;
    const user = getCurrentUser(req);
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }
    
    // Validate addresses
    if (!pickupAddress || !deliveryAddress) {
      return res.status(400).json({ error: 'Pickup and delivery addresses are required' });
    }
    
    // Calculate total
    const total = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity || item.price || 0);
    }, 0);
    
    // Get business if provided
    let business = null;
    if (businessId) {
      business = await prisma.business.findUnique({
        where: { id: businessId },
      });
      if (!business) {
        return res.status(404).json({ error: 'Business not found' });
      }
    }
    
    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        businessId: business?.id,
        items: items.map((item: any) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity || 1,
          price: item.price,
          total: item.price * (item.quantity || 1),
        })),
        total,
        deliveryFee: 0, // Will be calculated based on distance
        grandTotal: total,
        pickupAddress,
        deliveryAddress,
        deliveryNotes,
        paymentMethod,
        status: 'PENDING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        business: {
          select: { id: true, name: true, address: true, phone: true },
        },
      },
    });
    
    // Create notification for business
    if (businessId) {
      await prisma.notification.create({
        data: {
          userId: business.userId,
          title: 'New Order',
          message: `You have a new order #${order.id}`,
          type: 'order',
          data: { orderId: order.id },
        },
      });
    }
    
    // Broadcast new order to admins
    io.emit('new-order', {
      orderId: order.id,
      userId: user.id,
      businessId,
    });
    
    res.status(201).json(order);
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin or business)
router.get('/', async (req, res) => {
  try {
    const user = getCurrentUser(req);
    const { status, limit, offset, myOrders } = req.query;
    
    let where: any = {};
    
    // Filter by status if provided
    if (status) {
      where.status = status as string;
    }
    
    // For business users, filter by their business
    if (user.role === 'BUSINESS' && myOrders !== 'false') {
      where.businessId = user.business?.id;
    }
    
    // For rider users, filter by their assigned orders
    if (user.role === 'RIDER' && myOrders !== 'false') {
      where.riderId = user.rider?.id;
    }
    
    // For private users, filter by their orders (unless admin)
    if (user.role === 'PRIVATE' && myOrders !== 'false') {
      where.userId = user.id;
    }
    
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
      skip: offset ? parseInt(offset as string) : 0,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        business: {
          select: { id: true, name: true, address: true, phone: true },
        },
        rider: {
          select: { id: true, user: { select: { id: true, name: true, phone: true } } },
        },
      },
    });
    
    const total = await prisma.order.count({ where });
    
    res.json({ orders, total });
  } catch (error: any) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = getCurrentUser(req);
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        business: {
          select: { 
            id: true, 
            name: true, 
            address: true, 
            phone: true,
            user: { select: { id: true, name: true, email: true, phone: true } }
          },
        },
        rider: {
          select: { 
            id: true, 
            user: { select: { id: true, name: true, phone: true, avatar: true } },
            profile: true
          },
        },
      },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if user has permission to view this order
    const canView = 
      user.role === 'SYSTEM_OPERATOR' ||
      user.role === 'DEVELOPER' ||
      user.role === 'CUSTOMER_CARE' ||
      user.role === 'REGIONAL_OPERATOR' ||
      user.id === order.userId ||
      (user.business && user.business.id === order.businessId) ||
      (user.rider && user.rider.id === order.riderId);
    
    if (!canView) {
      return res.status(403).json({ error: 'Unauthorized to view this order' });
    }
    
    res.json(order);
  } catch (error: any) {
    console.error('Get order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update order status (for business or rider)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = getCurrentUser(req);
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        business: true,
        rider: true,
      },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      ['PENDING']: ['ASSIGNED', 'CANCELLED'],
      ['ASSIGNED']: ['PICKED_UP', 'CANCELLED'],
      ['PICKED_UP']: ['IN_TRANSIT', 'CANCELLED'],
      ['IN_TRANSIT']: ['DELIVERED', 'CANCELLED'],
      ['DELIVERED']: [],
      ['CANCELLED']: [],
    };
    
    const currentStatus = order.status as string;
    const newStatus = status as string;
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({
        error: `Cannot transition from ${currentStatus} to ${newStatus}`,
        validTransitions: validTransitions[currentStatus]
      });
    }
    
    // Check permissions
    const canUpdate = 
      user.role === 'SYSTEM_OPERATOR' ||
      user.role === 'DEVELOPER' ||
      user.role === 'CUSTOMER_CARE' ||
      user.role === 'REGIONAL_OPERATOR' ||
      (user.business && user.business.id === order.businessId) ||
      (user.rider && user.rider.id === order.riderId) ||
      user.id === order.userId;
    
    if (!canUpdate) {
      return res.status(403).json({ error: 'Unauthorized to update this order' });
    }
    
    // Additional checks for specific transitions
    if (newStatus === 'ASSIGNED') {
      if (user.role !== 'SYSTEM_OPERATOR' && 
          user.role !== 'DEVELOPER' &&
          user.role !== 'CUSTOMER_CARE' &&
          user.role !== 'REGIONAL_OPERATOR') {
        return res.status(403).json({ error: 'Only admin can assign orders to riders' });
      }
    }
    
    if (newStatus === 'PICKED_UP' || newStatus === 'DELIVERED') {
      if (user.rider?.id !== order.riderId) {
        return res.status(403).json({ error: 'Only the assigned rider can update this order status' });
      }
    }
    
    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'PICKED_UP' && { pickedUpAt: new Date() }),
        ...(newStatus === 'DELIVERED' && { deliveredAt: new Date() }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: { select: { id: true, name: true } },
        rider: { select: { id: true, user: { select: { id: true, name: true } } } },
      },
    });
    
    // Notify user
    if (order.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: 'Order Status Updated',
          message: `Your order #${order.id} status changed to ${newStatus}`,
          type: 'order',
          data: { orderId: order.id, status: newStatus },
        },
      });
    }
    
    // Broadcast status update
    io.to(id).emit('order-status-update', {
      orderId: id,
      status: newStatus,
      updatedBy: user.id,
    });
    
    res.json(updatedOrder);
  } catch (error: any) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Assign rider to order (admin only)
router.post('/:id/assign-rider', async (req, res) => {
  try {
    const { id } = req.params;
    const { riderId } = req.body;
    const user = getCurrentUser(req);
    
    // Check if user is admin
    const adminRoles = [
      'SYSTEM_OPERATOR',
      'DEVELOPER',
      'CUSTOMER_CARE',
      'REGIONAL_OPERATOR',
      'LOCAL_RIDER_MONITOR'
    ];
    
    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Only admin can assign orders to riders' });
    }
    
    const order = await prisma.order.findUnique({
      where: { id },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if rider exists
    const rider = await prisma.rider.findUnique({
      where: { id: riderId },
      include: { user: true, profile: true },
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    // Check if rider is approved
    if (rider.profile?.approvalStatus !== 'APPROVED') {
      return res.status(400).json({ error: 'Rider is not approved' });
    }
    
    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        riderId,
        status: 'ASSIGNED',
        updatedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        business: { select: { id: true, name: true } },
        rider: { select: { id: true, user: { select: { id: true, name: true, email: true } } } },
      },
    });
    
    // Notify rider
    await prisma.notification.create({
      data: {
        userId: rider.userId,
        title: 'New Order Assigned',
        message: `You have been assigned to order #${order.id}`,
        type: 'order',
        data: { orderId: order.id },
      },
    });
    
    // Notify user
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Rider Assigned',
        message: `A rider has been assigned to your order #${order.id}`,
        type: 'order',
        data: { orderId: order.id, riderId },
      },
    });
    
    // Broadcast assignment
    io.to(id).emit('order-assigned', {
      orderId: id,
      riderId,
      rider: { id: rider.id, name: rider.user.name },
    });
    
    res.json(updatedOrder);
  } catch (error: any) {
    console.error('Assign rider error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = getCurrentUser(req);
    
    // Check permission
    if (user.id !== userId && user.role !== 'SYSTEM_OPERATOR') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        business: { select: { id: true, name: true, address: true } },
        rider: { select: { id: true, user: { select: { id: true, name: true, phone: true } } } },
      },
    });
    
    res.json(orders);
  } catch (error: any) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get business's orders
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const user = getCurrentUser(req);
    
    // Check permission
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    if (user.business?.id !== businessId && user.role !== 'SYSTEM_OPERATOR') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const orders = await prisma.order.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        rider: { select: { id: true, user: { select: { id: true, name: true, phone: true } } } },
      },
    });
    
    res.json(orders);
  } catch (error: any) {
    console.error('Get business orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get rider's orders
router.get('/rider/:riderId', async (req, res) => {
  try {
    const { riderId } = req.params;
    const user = getCurrentUser(req);
    
    // Check permission
    const rider = await prisma.rider.findUnique({
      where: { id: riderId },
    });
    
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    
    if (user.rider?.id !== riderId && user.role !== 'SYSTEM_OPERATOR') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const orders = await prisma.order.findMany({
      where: { riderId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, address: true } },
        business: { select: { id: true, name: true, address: true, phone: true } },
      },
    });
    
    res.json(orders);
  } catch (error: any) {
    console.error('Get rider orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rate order (user rates rider and business)
router.post('/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { userRating, riderRating, businessRating, review } = req.body;
    const user = getCurrentUser(req);
    
    const order = await prisma.order.findUnique({
      where: { id },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.userId !== user.id) {
      return res.status(403).json({ error: 'Only the order owner can rate' });
    }
    
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ error: 'Can only rate delivered orders' });
    }
    
    // Update order with ratings
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        userRating: userRating as number | undefined,
        riderRating: riderRating as number | undefined,
        businessRating: businessRating as number | undefined,
      },
    });
    
    // Update rider rating if provided
    if (riderRating && order.riderId) {
      const riderProfile = await prisma.riderProfile.findUnique({
        where: { userId: order.rider?.userId },
      });
      
      if (riderProfile) {
        const newTotal = riderProfile.totalRatings + 1;
        const newRating = ((riderProfile.rating * riderProfile.totalRatings) + riderRating) / newTotal;
        
        await prisma.riderProfile.update({
          where: { userId: order.rider?.userId },
          data: {
            rating: newRating,
            totalRatings: newTotal,
          },
        });
      }
    }
    
    // Update business rating if provided
    if (businessRating && order.businessId) {
      const businessProfile = await prisma.businessProfile.findUnique({
        where: { userId: order.business?.userId },
      });
      
      if (businessProfile) {
        const newTotal = businessProfile.totalRatings + 1;
        const newRating = ((businessProfile.rating * businessProfile.totalRatings) + businessRating) / newTotal;
        
        await prisma.businessProfile.update({
          where: { userId: order.business?.userId },
          data: {
            rating: newRating,
            totalRatings: newTotal,
          },
        });
      }
    }
    
    // Create review if provided
    if (review) {
      await prisma.chatMessage.create({
        data: {
          conversationId: `order-${id}-review`,
          senderId: user.id,
          message: review,
          isAi: false,
          orderId: id,
          role: user.role,
        },
      });
    }
    
    res.json(updatedOrder);
  } catch (error: any) {
    console.error('Rate order error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
