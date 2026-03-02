import prisma from "./lib/prisma.js";

async function main() {
  console.log("🌱 Seeding Campus Transit Data...");

  // 1. Create the Bus Stops
  const gate = await prisma.busStop.upsert({
    where: { name: "Main Gate" },
    update: {},
    create: { name: "Main Gate", lat: 25.5335149, lng: 84.8550936 },
  });

  const aryabhatta = await prisma.busStop.upsert({
    where: { name: "Aryabhatta Hostel" },
    update: {},
    create: { name: "Aryabhatta Hostel", lat: 25.540448, lng: 84.8525089 },
  });

  const tutBlock = await prisma.busStop.upsert({
    where: { name: "Block 9" },
    update: {},
    create: { name: "Block 9", lat: 25.5327137, lng: 84.8518994 },
  });

  const dQuarters = await prisma.busStop.upsert({
    where: { name: "D Quarters" },
    update: {},
    // TODO: Update these coordinates from Google Maps
    create: { name: "D Quarters", lat: 25.548993, lng: 84.859703 },
  });

  // 2. Create a Bus
  const bus1 = await prisma.bus.upsert({
    where: { busNumber: "IITP-BUS-01" },
    update: {},
    create: {
      busNumber: "IITP-BUS-01",
      status: "ACTIVE",
      lat: 25.540448,
      lng: 84.8525089,
    },
  });

  // 3. Create the Daily Schedule
  await prisma.schedule.createMany({
    data: [
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "08:30",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "08:55",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "09:15",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "09:55",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "10:30",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "10:55",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "11:30",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "11:55",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "12:30",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "12:55",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: dQuarters.id,
        departureTime: "13:00",
      },
      {
        busId: bus1.id,
        sourceId: dQuarters.id,
        destId: aryabhatta.id,
        departureTime: "13:20",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "14:10",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "14:30",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "14:55",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "15:30",
      },
      {
        busId: bus1.id,
        sourceId: aryabhatta.id,
        destId: tutBlock.id,
        departureTime: "15:55",
      },
      {
        busId: bus1.id,
        sourceId: tutBlock.id,
        destId: aryabhatta.id,
        departureTime: "16:05",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeding Complete! Stops and Schedules are ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
