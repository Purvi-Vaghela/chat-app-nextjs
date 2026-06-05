import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma.js';

// Import routes
import usersRouter from './routes/users.js';
import conversationsRouter from './routes/conversations.js';
import groupsRouter from './routes/groups.js';
import uploadRouter from './routes/upload.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Store active users: { userId: socketId }
const activeUsers = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ChatApp Socket Server Running',
    activeUsers: activeUsers.size
  });
});

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/upload', uploadRouter);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Handle user login - update online status
  socket.on('user:online', async (userId) => {
    try {
      activeUsers.set(userId, socket.id);
      socket.userId = userId;
      
      // Update user status in database
      await prisma.user.update({
        where: { id: userId },
        data: { 
          isOnline: true,
          lastSeen: new Date()
        }
      });

      // Broadcast to all clients that this user is online
      io.emit('user:status', { userId, isOnline: true });
      
      console.log(`👤 User ${userId} is now online`);
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  });

  // Join conversation room
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`💬 Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`👋 Socket ${socket.id} left conversation ${conversationId}`);
  });

  // Join group room
  socket.on('group:join', (groupId) => {
    socket.join(`group:${groupId}`);
    console.log(`👥 Socket ${socket.id} joined group ${groupId}`);
  });

  // Leave group room
  socket.on('group:leave', (groupId) => {
    socket.leave(`group:${groupId}`);
    console.log(`🚪 Socket ${socket.id} left group ${groupId}`);
  });

  // Handle new message in conversation
  socket.on('message:send', async (data) => {
    try {
      const { conversationId, senderId, content, imageUrl } = data;
      
      // Save message to database
      const message = await prisma.message.create({
        data: {
          content,
          imageUrl,
          senderId,
          conversationId
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });

      // Broadcast message to conversation room
      io.to(`conversation:${conversationId}`).emit('message:new', message);
      
      console.log(`📨 Message sent in conversation ${conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message:error', { error: 'Failed to send message' });
    }
  });

  // Handle new message in group
  socket.on('group:message:send', async (data) => {
    try {
      const { groupId, senderId, content, imageUrl } = data;
      
      // Save message to database
      const message = await prisma.message.create({
        data: {
          content,
          imageUrl,
          senderId,
          groupId
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      });

      // Broadcast message to group room
      io.to(`group:${groupId}`).emit('group:message:new', message);
      
      console.log(`📨 Message sent in group ${groupId}`);
    } catch (error) {
      console.error('Error sending group message:', error);
      socket.emit('message:error', { error: 'Failed to send group message' });
    }
  });

  // Handle typing indicator
  socket.on('typing:start', (data) => {
    const { conversationId, userId, userName } = data;
    socket.to(`conversation:${conversationId}`).emit('typing:update', {
      userId,
      userName,
      isTyping: true
    });
  });

  socket.on('typing:stop', (data) => {
    const { conversationId, userId } = data;
    socket.to(`conversation:${conversationId}`).emit('typing:update', {
      userId,
      isTyping: false
    });
  });

  // Handle group typing indicator
  socket.on('group:typing:start', (data) => {
    const { groupId, userId, userName } = data;
    socket.to(`group:${groupId}`).emit('group:typing:update', {
      userId,
      userName,
      isTyping: true
    });
  });

  socket.on('group:typing:stop', (data) => {
    const { groupId, userId } = data;
    socket.to(`group:${groupId}`).emit('group:typing:update', {
      userId,
      isTyping: false
    });
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('❌ User disconnected:', socket.id);
    
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      
      try {
        // Update user status in database
        await prisma.user.update({
          where: { id: socket.userId },
          data: { 
            isOnline: false,
            lastSeen: new Date()
          }
        });

        // Broadcast to all clients that this user is offline
        io.emit('user:status', { userId: socket.userId, isOnline: false });
        
        console.log(`👤 User ${socket.userId} is now offline`);
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
  console.log(`📡 Frontend CORS allowed from: ${process.env.FRONTEND_URL}`);
});
