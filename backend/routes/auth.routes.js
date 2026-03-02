import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Example of a protected route to test your middleware
router.get('/me', verifyToken, (req, res) => {
  res.json({ message: 'You have access to this protected data', user: req.user });
});

export default router;