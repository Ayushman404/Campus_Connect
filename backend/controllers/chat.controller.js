import prisma from '../lib/prisma.js';

// Get or Create a conversation for a product between buyer and seller
export const getOrCreateConversation = async (req, res) => {
  const { productId, sellerId } = req.body;
  const buyerId = req.user.id;

  if (buyerId === sellerId) {
    return res.status(400).json({ error: "You cannot start a chat with yourself." });
  }

  try {
    // Check if conversation already exists
    let conversation = await prisma.conversation.findUnique({
      where: {
        productId_buyerId_sellerId: {
          productId,
          buyerId,
          sellerId
        }
      },
      include: {
        product: { select: { title: true, images: true, price: true, description: true } },
        buyer: { select: { name: true, profilePicture: true, email: true, contactNumber: true } },
        seller: { select: { name: true, profilePicture: true, email: true, contactNumber: true } },
        messages: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!conversation) {
      // Create new one if it doesn't exist
      conversation = await prisma.conversation.create({
        data: {
          productId,
          buyerId,
          sellerId
        },
        include: {
          product: { select: { title: true, images: true, price: true, description: true } },
          buyer: { select: { name: true, profilePicture: true, email: true, contactNumber: true } },
          seller: { select: { name: true, profilePicture: true, email: true, contactNumber: true } },
          messages: true
        }
      });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Chat Creation Error:", error);
    res.status(500).json({ error: "Failed to initialize conversation." });
  }
};

// Get all conversations for a user
export const getUserConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: {
        product: { select: { title: true, images: true, price: true, description: true } },
        buyer: { select: { id: true, name: true, profilePicture: true, email: true, contactNumber: true } },
        seller: { select: { id: true, name: true, profilePicture: true, email: true, contactNumber: true } },
        messages: {
           orderBy: { createdAt: 'desc' },
           take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Fetch Conversations Error:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        buyer: true,
        seller: true
      }
    });

    if (!conversation) return res.status(404).json({ error: "Conversation not found." });
    
    // Auth check
    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      return res.status(403).json({ error: "Unauthorized access to this chat." });
    }

    res.status(200).json(conversation.messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to load messages." });
  }
};
