import prisma from '../lib/prisma.js';

// 1. Hydration: Get last known locations of active buses
export const getLiveBuses = async (req, res) => {
  try {
    const buses = await prisma.bus.findMany({
      where: { status: 'ACTIVE' },
      select: { 
        busNumber: true, 
        lat: true, 
        lng: true, 
        lastUpdated: true,
        driverName: true,
        driverContact: true
      }
    });
    res.status(200).json(buses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch live buses' });
  }
};

// 2. Map Data: Get all static bus stops (Red circles on the map)
export const getStops = async (req, res) => {
  try {
    const stops = await prisma.busStop.findMany();
    res.status(200).json(stops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch bus stops' });
  }
};

// 3. Timetable: Get schedule with actual stop names attached
export const getSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        bus: { 
          select: { 
            busNumber: true,
            driverName: true,
            driverContact: true 
          } 
        },
        source: { select: { name: true } },
        dest: { select: { name: true } }
      },
      orderBy: { departureTime: 'asc' }
    });
    res.status(200).json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch schedules' });
  }
};