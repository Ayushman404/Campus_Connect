import express from 'express';
import { createProduct, getProducts, getProductById, expressInterest, markAsSold, deleteProduct } from '../controllers/product.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// GET /api/products (Marketplace feed - Logged in students only)
router.get('/', verifyToken, getProducts);

// GET /api/products/:id (Get single product by ID)
router.get('/:id', verifyToken, getProductById);

// POST /api/products (Create a listing)
router.post('/', verifyToken, upload.array('images', 5), createProduct);

// POST /api/products/:id/interest (Click "I'm interested")
router.post('/:id/interest', verifyToken, expressInterest);

// PUT /api/products/:id/sold (Seller manually updates stock after offline deal)
router.put('/:id/sold', verifyToken, markAsSold);

// DELETE /api/products/:id (Seller deletes listing)
router.delete('/:id', verifyToken, deleteProduct);

export default router;
