import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/users/profile - Protected
router.get('/profile', verifyToken, getProfile);

// PUT /api/users/profile - Protected
router.put('/profile', verifyToken, updateProfile);

export default router;
