import prisma from '../lib/prisma.js';

// --- 1. CREATE A NEW LISTING ---
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, listingType, stockQuantity } = req.body;
    const sellerId = req.user.id; 

    // Construct the image URLs if files were uploaded
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      imageUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        listingType, 
        stockQuantity: parseInt(stockQuantity) || 1,
        images: imageUrls,
        sellerId
      }
    });

    res.status(201).json({ message: 'Product listed successfully!', product });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ error: 'Failed to create product listing.' });
  }
};

// --- 2. GET ALL AVAILABLE PRODUCTS (MARKETPLACE FEED) ---
export const getProducts = async (req, res) => {
  try {
    const { type } = req.query; // Frontend can send ?type=SELL or ?type=RENT
    
    const whereClause = { status: 'AVAILABLE' }; // Don't show out-of-stock items in feed
    if (type) {
      whereClause.listingType = type;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        seller: { select: { name: true, profilePicture: true } } // Show who is selling it
      },
      orderBy: { createdAt: 'desc' } // Newest first
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Fetch Products Error:", error);
    res.status(500).json({ error: 'Failed to fetch the marketplace feed.' });
  }
};

// --- 2.5 GET PRODUCT BY ID ---
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { name: true, profilePicture: true } }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Fetch Product Error:", error);
    res.status(500).json({ error: 'Failed to fetch product details.' });
  }
};

// --- 3. EXPRESS INTEREST (PEER-TO-PEER CONNECTION) ---
export const expressInterest = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const buyerId = req.user.id;
    const { message } = req.body; 

    // Prevent user from expressing interest in their own product
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    if (product.sellerId === buyerId) {
      return res.status(400).json({ error: 'You cannot express interest in your own listing.' });
    }

    const interest = await prisma.interest.create({
      data: { productId, buyerId, message }
    });

    res.status(201).json({ message: 'Interest expressed! The seller will be notified.', interest });
  } catch (error) {
    // Prisma throws P2002 if a unique constraint fails (user already showed interest)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'You have already expressed interest in this item.' });
    }
    console.error("Interest Error:", error);
    res.status(500).json({ error: 'Failed to express interest.' });
  }
};

// --- 4. MARK AS SOLD / RENTED OUT ---
export const markAsSold = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const sellerId = req.user.id;

    // Verify the person trying to mark it as sold actually owns it
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.sellerId !== sellerId) {
      return res.status(403).json({ error: 'Unauthorized to update this product.' });
    }

    // Deduct stock and update status automatically
    const newStock = product.stockQuantity - 1;
    const newStatus = newStock <= 0 
      ? (product.listingType === 'SELL' ? 'SOLD_OUT' : 'RENTED_OUT') 
      : 'AVAILABLE';

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { 
        stockQuantity: newStock,
        status: newStatus
      }
    });

    res.status(200).json({ message: 'Product updated successfully!', product: updatedProduct });
  } catch (error) {
    console.error("Update Stock Error:", error);
    res.status(500).json({ error: 'Failed to update product status.' });
  }
};

// --- 5. DELETE A LISTING ---
export const deleteProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const sellerId = req.user.id;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.sellerId !== sellerId) {
      return res.status(403).json({ error: 'Unauthorized to delete this product.' });
    }

    await prisma.product.delete({ where: { id: productId } });

    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
};
