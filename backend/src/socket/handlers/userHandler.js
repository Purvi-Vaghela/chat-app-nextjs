import prisma from '../../lib/prisma.js';

// Store active users: { userId: socketId }
export const activeUsers = new Map();

export const handleUserOnline = (io) => (socket) => {
  socket.on('user:online', async (userId) => {
    try {
      const isFirstSession = !activeUsers.has(userId);
      if (isFirstSession) {
        activeUsers.set(userId, new Set());
      }
      activeUsers.get(userId).add(socket.id);
      socket.userId = userId;
      
      if (isFirstSession) {
        // Update user status in database
        await prisma.user.update({
          where: { id: userId },
          data: { 
            isOnline: true,
            lastSeen: new Date()
          }
        });
      }

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

      if (isFirstSession) {
        // Broadcast to all clients that this user is online
        io.emit('user:status', { userId, isOnline: true });
        console.log(`👤 User ${userId} is now online and joined ${conversations.length} chats & ${groups.length} groups`);
      } else {
        console.log(`👤 User ${userId} opened another session (total: ${activeUsers.get(userId).size})`);
      }
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  });
};

export const handleUserDisconnect = (io) => (socket) => {
  socket.on('disconnect', async () => {
    console.log('❌ User disconnected:', socket.id);
    
    if (socket.userId) {
      const userSockets = activeUsers.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        
        if (userSockets.size === 0) {
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
        } else {
          console.log(`👤 User ${socket.userId} closed one session (remaining: ${userSockets.size})`);
        }
      }
    }
  });
};
