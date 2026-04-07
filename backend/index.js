import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import prisma from './lib/prisma.js';
import path from 'path';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import busRoutes from './routes/bus.routes.js'; 
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();
const httpServer = createServer(app);

app.use(cors()); 
app.use(express.json());

// Serve Static Files (Marketplace Images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);

const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Basic Health Check
app.get('/status', async (req, res) => {
  res.json({ status: 'Alive' });
});

// --- REAL-TIME & NOTIFICATION SOCKET LOGIC ---

const lastDbUpdate = {}; 
const DB_UPDATE_INTERVAL = 10000; // Save to DB every 10 seconds

const activeBuses = {}; 

io.on('connection', (socket) => {
  console.log('🟢 New connection:', socket.id);

  // 1. CHAT LOGIC
  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
    console.log(`👤 User joined room: ${conversationId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { conversationId, senderId, text } = data;
    try {
      // Save message to DB
      const message = await prisma.message.create({
        data: { conversationId, senderId, text }
      });
      
      // Update conversation updatedAt timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      // Broadcast to room
      io.to(conversationId).emit('receiveMessage', message);
    } catch (error) {
      console.error('Socket Message Error:', error.message);
    }
  });

  // 2. NOTIFICATIONS
  socket.on('subscribeToNotifications', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`🔔 User subscribed to alerts: ${userId}`);
  });

  socket.on('sendNotification', async (data) => {
    const { userId, type, title, message, link } = data;
    try {
      // Save to DB
      const dbNotification = await prisma.notification.create({
        data: { userId, type, title, message, link }
      });
      // Emit to specific user
      io.to(`user_${userId}`).emit('newNotification', dbNotification);
    } catch (error) {
      console.error('Socket Notification Error:', error.message);
    }
  });

  // 3. BUS TRACKING (PRO-BONO LEGACY LOGIC)
  socket.on('driverLocationUpdate', async (data) => {
    // 1. FAST PATH: Broadcast to React UI immediately
  // Send the newly connected student the last known locations immediately
  socket.emit('initialBusLocations', activeBuses);

  socket.on('driverLocationUpdate', async (data) => {
    // Cache the latest location for future connections
    activeBuses[data.busId] = data;

    // 1. FAST PATH: Broadcast to React UI immediately (2s interval)
    socket.broadcast.emit('busMoved', data);

    // 2. SLOW PATH: Database Persistence
    const now = Date.now();
    const lastUpdate = lastDbUpdate[data.busId] || 0;

    if (now - lastUpdate > DB_UPDATE_INTERVAL) {
      try {
        await prisma.bus.update({
          where: { busNumber: data.busId },
          data: { 
            lat: data.lat, 
            lng: data.lng,
            lastUpdated: new Date()
          }
        });
        
        lastDbUpdate[data.busId] = now;
      } catch (error) {
        console.error('DB Update failed:', error.message);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});