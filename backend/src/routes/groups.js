import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

// Get all groups for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isOnline: true,
                lastSeen: true
              }
            }
          }
        },
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
    
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name, description, image, creatorId, memberIds } = req.body;
    
    if (!name || !creatorId || !memberIds || memberIds.length === 0) {
      return res.status(400).json({ 
        error: 'Group name, creator ID, and at least one member are required' 
      });
    }
    
    // Create group with members
    const group = await prisma.group.create({
      data: {
        name,
        description,
        image,
        creatorId,
        members: {
          create: [
            // Add creator as admin
            {
              userId: creatorId,
              role: 'admin'
            },
            // Add other members
            ...memberIds
              .filter(id => id !== creatorId)
              .map(userId => ({
                userId,
                role: 'member'
              }))
          ]
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isOnline: true,
                lastSeen: true
              }
            }
          }
        }
      }
    });
    
    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get group by ID
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;
    
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isOnline: true,
                lastSeen: true
              }
            }
          }
        },
        messages: {
          where: {
            ...(userId && {
              NOT: {
                deletedFor: {
                  has: userId
                }
              }
            })
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
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Add member to group
router.post('/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, addedBy } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });
    
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }
    
    // Add member
    const member = await prisma.groupMember.create({
      data: {
        userId,
        groupId,
        role: 'member'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isOnline: true,
            lastSeen: true
          }
        }
      }
    });
    
    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding member to group:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from group
router.delete('/:groupId/members/:userId', async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    
    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member from group:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get messages for a group
router.get('/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, before, userId } = req.query;
    
    const messages = await prisma.message.findMany({
      where: {
        groupId,
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
    console.error('Error fetching group messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
