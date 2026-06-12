import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all conversations for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId
        }
      },
      include: {
        messages: {
          where: {
            NOT: {
              deletedFor: {
                has: userId
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
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
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Fetch participant details for each conversation
    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conv) => {
        const participants = await prisma.user.findMany({
          where: {
            id: {
              in: conv.participantIds
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isOnline: true,
            lastSeen: true
          }
        });
        
        return {
          ...conv,
          participants
        };
      })
    );
    
    res.json(conversationsWithParticipants);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get or create conversation between two users
router.post('/find-or-create', async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;
    
    if (!userId1 || !userId2) {
      return res.status(400).json({ error: 'Both user IDs are required' });
    }
    
    // Find existing conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participantIds: { has: userId1 } },
          { participantIds: { has: userId2 } }
        ]
      },
      include: {
        messages: {
          where: {
            NOT: {
              deletedFor: {
                has: userId1
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
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
        }
      }
    });
    
    if (existingConversation) {
      const participants = await prisma.user.findMany({
        where: {
          id: {
            in: existingConversation.participantIds
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isOnline: true,
          lastSeen: true
        }
      });
      
      return res.json({
        ...existingConversation,
        participants
      });
    }
    
    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        participantIds: [userId1, userId2]
      },
      include: {
        messages: true
      }
    });
    
    const participants = await prisma.user.findMany({
      where: {
        id: {
          in: newConversation.participantIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isOnline: true,
        lastSeen: true
      }
    });
    
    res.status(201).json({
      ...newConversation,
      participants
    });
  } catch (error) {
    console.error('Error finding or creating conversation:', error);
    res.status(500).json({ error: 'Failed to process conversation' });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before, userId } = req.query;
    
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(userId && {
          NOT: {
            deletedFor: {
              has: userId
            }
          }
        }),
        ...(before && {
          createdAt: {
            lt: new Date(before)
          }
        })
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });
    
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
