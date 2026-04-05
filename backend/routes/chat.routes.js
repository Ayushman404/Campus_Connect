import express from 'express';
import { getOrCreateConversation, getUserConversations, getMessages } from '../controllers/chat.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET all active conversations for the current user
router.get('/', verifyToken, getUserConversations);

// GET messages for a specific conversation
router.get('/:id', verifyToken, getMessages);

// POST initialize/fetch a conversation for a product
router.post('/init', verifyToken, getOrCreateConversation);

export default router;
