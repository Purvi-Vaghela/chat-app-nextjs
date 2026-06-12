import prisma from '../../lib/prisma.js';
import { activeUsers } from './userHandler.js';

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

      // Update conversation's updatedAt field
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      // Broadcast message to conversation room
      io.to(`conversation:${conversationId}`).emit('message:new', message);

      // Send directly to other online participants of the conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { participantIds: true }
      });

      if (conversation) {
        conversation.participantIds.forEach((pId) => {
          if (pId !== senderId) {
            const socketId = activeUsers.get(pId);
            if (socketId) {
              io.to(socketId).emit('message:new', message);
            }
          }
        });
      }
      
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

      // Update group's updatedAt field
      await prisma.group.update({
        where: { id: groupId },
        data: { updatedAt: new Date() }
      });

      // Broadcast message to group room
      io.to(`group:${groupId}`).emit('group:message:new', message);

      // Send directly to other online members of the group
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: {
          members: {
            select: { userId: true }
          }
        }
      });

      if (group) {
        group.members.forEach((m) => {
          if (m.userId !== senderId) {
            const socketId = activeUsers.get(m.userId);
            if (socketId) {
              io.to(socketId).emit('group:message:new', message);
            }
          }
        });
      }
      
      console.log(`📨 Message sent in group ${groupId}`);
    } catch (error) {
      console.error('Error sending group message:', error);
      socket.emit('message:error', { error: 'Failed to send group message' });
    }
  });
};
