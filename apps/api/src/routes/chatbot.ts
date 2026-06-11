import express from 'express';
import { prisma } from '@recap/database';
import { getCurrentUser } from '../middleware/auth';

const router = express.Router();

// Chat with AI (Mistral)
router.post('/chat', async (req, res) => {
  try {
    const { message, orderId, conversationId } = req.body;
    const user = getCurrentUser(req);
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Call Mistral AI
    const { getChatResponse } = await import('../../../chatbot/src/index');
    
    const response = await getChatResponse(
      message,
      user.role
    );
    
    // Save conversation
    let conv;
    if (conversationId) {
      conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (!conv) {
        conv = await prisma.conversation.create({
          data: {
            userId: user.id,
            orderId,
            isOpen: true,
          },
        });
      }
    } else {
      conv = await prisma.conversation.create({
        data: {
          userId: user.id,
          orderId,
          isOpen: true,
        },
      });
    }
    
    // Save user message
    await prisma.chatMessage.create({
      data: {
        conversationId: conv.id,
        senderId: user.id,
        message,
        isAi: false,
        orderId,
        role: user.role,
      },
    });
    
    // Save AI response
    await prisma.chatMessage.create({
      data: {
        conversationId: conv.id,
        senderId: 'ai',
        message: response,
        isAi: true,
        orderId,
        role: 'AI',
      },
    });
    
    res.json({ 
      response, 
      conversationId: conv.id,
      isAi: true
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get conversation messages
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user = getCurrentUser(req);
    
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true, googleImage: true, role: true },
            },
          },
        },
        user: {
          select: { id: true, name: true },
        },
        order: {
          select: { id: true, orderNumber: true },
        },
      },
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check permission
    if (conversation.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(conversation);
  } catch (error: any) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user conversations
router.get('/conversations', async (req, res) => {
  try {
    const user = getCurrentUser(req);
    const { limit, offset, orderId } = req.query;
    
    const where: any = { userId: user.id };
    if (orderId) {
      where.orderId = orderId as string;
    }
    
    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit ? parseInt(limit as string) : 20,
      skip: offset ? parseInt(offset as string) : 0,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { message: true, createdAt: true, isAi: true },
        },
        order: {
          select: { id: true, orderNumber: true, status: true },
        },
        _count: {
          select: { messages: true },
        },
      },
    });
    
    const total = await prisma.conversation.count({ where });
    
    res.json({ conversations, total });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Close conversation
router.patch('/conversation/:conversationId/close', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user = getCurrentUser(req);
    
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (conversation.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        isOpen: false,
        isResolved: true,
        updatedAt: new Date(),
      },
    });
    
    res.json(updated);
  } catch (error: any) {
    console.error('Close conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark conversation as unresolved
router.patch('/conversation/:conversationId/reopen', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user = getCurrentUser(req);
    
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    if (conversation.userId !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        isOpen: true,
        isResolved: false,
        updatedAt: new Date(),
      },
    });
    
    res.json(updated);
  } catch (error: any) {
    console.error('Reopen conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new conversation
router.post('/conversation', async (req, res) => {
  try {
    const { orderId } = req.body;
    const user = getCurrentUser(req);
    
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        orderId,
        isOpen: true,
        isResolved: false,
      },
    });
    
    res.status(201).json(conversation);
  } catch (error: any) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
