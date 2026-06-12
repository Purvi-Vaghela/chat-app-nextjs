import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Delete messages
router.post('/delete', async (req, res) => {
  try {
    const { messageIds, type, userId } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'Message IDs are required' });
    }
    
    if (type === 'everyone') {
      // 1. Fetch messages to verify sender
      const messages = await prisma.message.findMany({
        where: {
          id: { in: messageIds }
        }
      });
      
      // Verify that all messages belong to the user
      const isOwnerAll = messages.every(msg => msg.senderId === userId);
      if (!isOwnerAll) {
        return res.status(403).json({ error: 'You can only delete your own messages for everyone' });
      }
      
      // 2. Perform soft deletion
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds }
        },
        data: {
          isDeletedForEveryone: true,
          content: 'This message was deleted',
          imageUrl: null
        }
      });
      
      // 3. Broadcast to sockets
      const firstMsg = messages[0];
      if (firstMsg) {
        const payload = { messageIds, type: 'everyone' };
        if (firstMsg.conversationId) {
          payload.conversationId = firstMsg.conversationId;
          req.io.to(`conversation:${firstMsg.conversationId}`).emit('messages:deleted', payload);
        } else if (firstMsg.groupId) {
          payload.groupId = firstMsg.groupId;
          req.io.to(`group:${firstMsg.groupId}`).emit('messages:deleted', payload);
        }
      }
      
      res.json({ message: 'Messages deleted for everyone successfully' });
      
    } else if (type === 'me') {
      // Add userId to deletedFor array
      await Promise.all(
        messageIds.map(id =>
          prisma.message.update({
            where: { id },
            data: {
              deletedFor: {
                push: userId
              }
            }
          })
        )
      );
      
      res.json({ message: 'Messages deleted for me successfully' });
    } else {
      res.status(400).json({ error: 'Invalid deletion type' });
    }
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ error: 'Failed to delete messages' });
  }
});

export default router;
