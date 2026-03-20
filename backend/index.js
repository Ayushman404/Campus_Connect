import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import prisma from './lib/prisma.js';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import busRoutes from './routes/bus.routes.js'; // NEW

const app = express();
const httpServer = createServer(app);

app.use(cors()); 
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes); // NEW

const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Basic Health Check
app.get('/status', async (req, res) => {
  res.json({ status: 'Alive' });
});

// --- REAL-TIME BUS TRACKING WITH DB THROTTLING ---

// In-memory cache to track the last time a bus saved to PostgreSQL
const lastDbUpdate = {}; 
const DB_UPDATE_INTERVAL = 10000; // Save to DB every 10 seconds

const activeBuses = {}; 

io.on('connection', (socket) => {
  console.log('🟢 New connection:', socket.id);

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

    // Only hit PostgreSQL if 10 seconds have passed for THIS specific bus
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
        console.log(`💾 Persisted ${data.busId} to DB`);
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