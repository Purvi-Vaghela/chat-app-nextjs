import prisma from '../../lib/prisma.js';

export const handleConversationMessage = (io) => (socket) => {
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
};

export const handleGroupMessage = (io) => (socket) => {
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
};
