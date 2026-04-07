import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { subDays, startOfDay, addMinutes, addHours, isAfter } from "date-fns";

const connectionString = process.env.DATABASE_URL as string;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set in environment.");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const now = new Date();
  console.log(`[${now.toISOString()}] Starting incremental analytics sync...`);

  // 1. Fetch all projects
  const projects = await prisma.project.findMany({
    include: {
      organisation: true,
    },
  });

  console.log(`Found ${projects.length} projects to process.`);

  const eventTypes = ["page_view", "signup", "purchase", "button_click"];

  for (const project of projects) {
    console.log(`Processing project: ${project.name} (${project.id})`);

    // 2. Find the most recent event date
    const latestEvent = await prisma.event.findFirst({
      where: { projectId: project.id },
      orderBy: { occurredAt: "desc" },
    });

    let startDate: Date;

    if (!latestEvent) {
      // If no data, generate last 90 days
      console.log("  No existing data found. Generating full 90-day history.");
      startDate = subDays(startOfDay(now), 90);
    } else {
      startDate = latestEvent.occurredAt;
      console.log(`  Last event seen at: ${startDate.toISOString()}`);
    }

    if (isAfter(startDate, now)) {
      console.log("  Project is already up to date.");
      continue;
    }

    // 3. Generate missing events
    const eventsToCreate = [];
    let currentDate = new Date(startDate);

    // Add 1 minute to avoid duplicating the latest event
    currentDate.setMinutes(currentDate.getMinutes() + 1);

    // Iterating by day for generation logic
    while (currentDate < now) {
      const isWeekend = [0, 6].includes(currentDate.getDay());
      const baseHourlyVolume = isWeekend ? 2 : 6;

      // Hourly generation to be more precise for sync
      for (let hour = 0; hour < 24; hour++) {
        const hourDate = addHours(startOfDay(currentDate), hour);
        if (hourDate < startDate || hourDate > now) continue;

        const volume = Math.floor(baseHourlyVolume * (0.5 + Math.random()));

        for (let j = 0; j < volume; j++) {
          const type =
            eventTypes[Math.floor(Math.random() * eventTypes.length)];
          let revenue = 0;

          if (type === "purchase") {
            revenue = Math.floor(Math.random() * 5000) + 500;
          }

          const occurredAt = addMinutes(
            hourDate,
            Math.floor(Math.random() * 60)
          );
          if (occurredAt > now) continue;

          eventsToCreate.push({
            projectId: project.id,
            eventType: type,
            revenue: revenue.toString(),
            occurredAt,
            properties: {
              session_id: `sess_${Math.random().toString(36).substring(7)}`,
            },
          });
        }
      }

      currentDate = addHours(currentDate, 24);
    }

    // 4. Bulk insert
    if (eventsToCreate.length > 0) {
      console.log(`  Inserting ${eventsToCreate.length} new events...`);
      await prisma.event.createMany({
        data: eventsToCreate,
      });
    } else {
      console.log("  No new events to insert.");
    }
  }

  console.log(`[${new Date().toISOString()}] Sync completed successfully!`);
}

main()
  .catch((e) => {
    console.error(`[${new Date().toISOString()}] Sync failed:`, e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
