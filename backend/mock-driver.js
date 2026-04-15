import { io } from 'socket.io-client';

// Connect to your local backend
const socket = io('http://localhost:5000');

// An array of coordinates simulating a path through the campus
const campusRoute = [
  [25.540448, 84.8525089], // Start near Gate
  [25.539754,84.852934],
  [25.538796,84.852038],
  [25.538698, 84.850321], // Midpoint
  [25.538107, 84.849751],
  [25.537457, 84.851105], // Academic Area
  [25.537019, 84.852452], // Academic Area
  [25.535979, 84.853605], // Academic Area
  [25.534702, 84.853954], // Academic Area
  [25.533732, 84.853663], // Academic Area
  [25.532770, 84.852753], // Academic Area
  [25.532306, 84.851987], // Academic Area
];

let currentIndex = 0;

socket.on('connect', () => {
  console.log(`🚌 Mock Driver Connected! ID: ${socket.id}`);
  console.log('Starting route simulation...');

  // Send a new location every 2 seconds
  setInterval(() => {
    const [lat, lng] = campusRoute[currentIndex];
    
    const payload = {
      busId: 'BR01PM6850', // Matches Bus 01 in the real schedule
      lat: lat,
      lng: lng,
      timestamp: new Date().toISOString()
    };

    socket.emit('driverLocationUpdate', payload);
    console.log(`Sent update: [${lat}, ${lng}]`);

    // Loop back to the start when reaching the end
    currentIndex = (currentIndex + 1) % campusRoute.length;
  }, 2000);
});

socket.on('disconnect', () => {
  console.log('Driver disconnected from server.');
});