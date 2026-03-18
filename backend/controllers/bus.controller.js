import prisma from '../lib/prisma.js'

// Hydration: Called once when the frontend map loads to place all active buses on the map
export const getLiveBuses = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      where: { status: 'ACTIVE' }, // Only fetch buses currently on the road
      select: { id: true, busNumber: true, lat: true, lng: true, lastUpdated: true } // id is needed to match incoming socket updates to the right map marker
    });
    res.status(200).json(buses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch live buses' });
  }
};

// Map Data: Returns all static bus stops to render as markers on the map
// These are pre-seeded via seed-location.js and don't change at runtime
export const getStops = async (req, res) => {
  try {
    const stops = await prisma.busStop.findMany();
    res.status(200).json(stops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch bus stops' });
  }
};

// Timetable: Returns the full schedule sorted chronologically
// Only fetches what the frontend actually needs — busNumber, source name, dest name
export const getSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        bus: { select: { busNumber: true } },        // Just the bus number, not the entire bus object
        source: { select: { name: true } },          // Just the stop name, not lat/lng etc.
        dest: { select: { name: true } }             // Same for destination
      },
      orderBy: { departureTime: 'asc' }              // Sorted so frontend doesn't have to
    });
    res.status(200).json(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch schedules' });
  }
};