import express from 'express';
import { getUserNotifications, markAsRead } from '../controllers/notification.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET all notifications for the current user
router.get('/', verifyToken, getUserNotifications);

// PUT mark a notification as read
router.put('/:id/read', verifyToken, markAsRead);

export default router;
