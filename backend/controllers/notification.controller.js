import prisma from '../lib/prisma.js';

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  const { userId, type, title, message, link } = req.body;

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link
      }
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to create notification." });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized access to this notification." });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read." });
  }
};
