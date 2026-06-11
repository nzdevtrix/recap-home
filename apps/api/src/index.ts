import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import registerRoutes from './routes/register';
import orderRoutes from './routes/orders';
import riderRoutes from './routes/riders';
import chatbotRoutes from './routes/chatbot';
import uploadRoutes from './routes/upload';
import path from 'path';
import { authenticate, getCurrentUser } from './middleware/auth';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/register', registerRoutes);
app.use('/orders', authenticate, orderRoutes);
app.use('/riders', authenticate, riderRoutes);
app.use('/chatbot', authenticate, chatbotRoutes);
app.use('/upload', uploadRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected test route
app.get('/protected', authenticate, (req, res) => {
  const user = getCurrentUser(req);
  res.json({ 
    message: 'You are authenticated!', 
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    }
  });
});

// Socket.io with authentication
const httpServer = createServer(app);
const io = new Server(httpServer, { 
  cors: { 
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3002'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  const { verifyToken } = require('./utils/auth');
  const payload = verifyToken(token);
  
  if (!payload) {
    return next(new Error('Invalid token'));
  }
  
  (socket as any).userId = payload.userId;
  (socket as any).userRole = payload.role;
  next();
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, 'User:', (socket as any).userId);
  
  socket.on('join-order', (orderId: string) => {
    socket.join(orderId);
    console.log(`User ${(socket as any).userId} joined order ${orderId}`);
  });
  
  socket.on('leave-order', (orderId: string) => {
    socket.leave(orderId);
    console.log(`User ${(socket as any).userId} left order ${orderId}`);
  });
  
  socket.on('location-update', (data: { orderId: string; lat: number; lng: number }) => {
    socket.to(data.orderId).emit('rider-location-update', {
      userId: (socket as any).userId,
      ...data
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

export { io };

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`API + Socket.io running on port ${PORT}`);
  console.log(`Allowed origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3002'}`);
});