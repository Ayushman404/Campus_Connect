import "dotenv/config";
import prisma from "./lib/prisma.js";
import fs from "fs/promises";
import path from "path";

async function main() {
  console.log("🌱 Seeding REAL Campus Transit Data...");

  // Read the schedule from JSON
  const dataPath = path.join(process.cwd(), "real-schedule.json");
  const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));

  // 1. Clear existing schedules to ensure a clean state
  console.log("🧹 Clearing old schedule data...");
  await prisma.schedule.deleteMany();

  // 2. Create/Update the Bus Stops
  console.log("📍 Upserting Bus Stops...");
  const stopMap = {};
  for (const stop of data.stops) {
    const dbStop = await prisma.busStop.upsert({
      where: { name: stop.name },
      update: { lat: stop.lat, lng: stop.lng },
      create: { name: stop.name, lat: stop.lat, lng: stop.lng },
    });
    stopMap[stop.name] = dbStop.id;
  }

  // 3. Create/Update the Buses
  console.log("🚌 Upserting Buses with Driver Info...");
  const busMap = {};
  for (const bus of data.buses) {
    const dbBus = await prisma.bus.upsert({
      where: { busNumber: bus.id },
      update: {
        status: "ACTIVE",
        driverName: bus.driver,
        driverContact: bus.contact
      },
      create: {
        busNumber: bus.id,
        status: "ACTIVE",
        driverName: bus.driver,
        driverContact: bus.contact
      },
    });
    busMap[bus.id] = dbBus.id;
  }

  // 4. Inject the Schedules
  console.log("🕒 Injecting Schedules with Day Types...");
  const scheduleData = data.schedules.map(sch => ({
    busId: busMap[sch.busId],
    sourceId: stopMap[sch.source],
    destId: stopMap[sch.dest],
    departureTime: sch.time,
    dayType: sch.dayType || "WEEKDAY"
  }));

  await prisma.schedule.createMany({
    data: scheduleData,
    skipDuplicates: true,
  });

  console.log(`✅ Seeding Complete! ${scheduleData.length} records added.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });