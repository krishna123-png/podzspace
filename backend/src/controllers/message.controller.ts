import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { io } from '../server';
import { prisma } from '../lib/prisma';

// Send a message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.userId;
    const { receiverId, studioId, content } = req.body;

    if (!senderId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        studioId: studioId || null,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
        studio: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Emit real-time event to both sender and receiver
    io.to(`user-${receiverId}`).emit('new-message', message);
    io.to(`user-${senderId}`).emit('new-message', message);

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all conversations for a user
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
        studio: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group messages by conversation (other user + studio combination)
    const conversationsMap = new Map<string, any>();

    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const conversationKey = `${otherUserId}-${message.studioId || 'general'}`;

      if (!conversationsMap.has(conversationKey)) {
        const otherUser = message.senderId === userId ? message.receiver : message.sender;
        conversationsMap.set(conversationKey, {
          otherUser: otherUser,
          studio: message.studio || null,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      // Count unread messages (messages sent to current user that are unread)
      if (message.receiverId === userId && !message.isRead) {
        const conversation = conversationsMap.get(conversationKey);
        if (conversation) {
          conversation.unreadCount += 1;
        }
      }
    });

    const conversations = Array.from(conversationsMap.values());

    console.log(`Fetched ${conversations.length} conversations for user ${userId}`);

    res.json({
      message: 'Conversations fetched successfully',
      data: conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params; // Format: "otherUserId-studioId"

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log(`ConversationId received: ${conversationId}`);
    
    // UUIDs are 36 characters (with dashes), so we need to split properly
    // Format: "uuid-uuid" or "uuid-general"
    const otherUserId = conversationId.substring(0, 36);
    const studioIdentifier = conversationId.substring(37); // After the UUID and separator dash
    const studioId = studioIdentifier === 'general' ? null : studioIdentifier;

    console.log(`Fetching messages: userId=${userId}, otherUserId=${otherUserId}, studioId=${studioId}`);

    // Fetch messages between the two users for the specific studio
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        studioId: studioId,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
        studio: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Fetched ${messages.length} messages for conversation ${conversationId}`);

    res.json({
      message: 'Messages fetched successfully',
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error', error: String(error) });
  }
};

// Mark a message as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { messageId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify the message is for this user
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiverId !== userId) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    res.json({
      message: 'Message marked as read',
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
