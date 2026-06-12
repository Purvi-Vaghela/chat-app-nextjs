import prisma from '../../lib/prisma.js';

// Store active users: { userId: socketId }
export const activeUsers = new Map();

export const handleUserOnline = (io) => (socket) => {
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

      // Auto-join conversation rooms
      const conversations = await prisma.conversation.findMany({
        where: {
          participantIds: {
            has: userId
          }
        },
        select: { id: true }
      });
      conversations.forEach((conv) => {
        socket.join(`conversation:${conv.id}`);
      });

      // Auto-join group rooms
      const groups = await prisma.group.findMany({
        where: {
          members: {
            some: {
              userId
            }
          }
        },
        select: { id: true }
      });
      groups.forEach((g) => {
        socket.join(`group:${g.id}`);
      });

      // Broadcast to all clients that this user is online
      io.emit('user:status', { userId, isOnline: true });
      
      console.log(`👤 User ${userId} is now online and joined ${conversations.length} chats & ${groups.length} groups`);
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  });
};

export const handleUserDisconnect = (io) => (socket) => {
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
};
