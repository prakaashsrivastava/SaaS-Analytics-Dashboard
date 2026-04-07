import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcryptjs from 'bcryptjs';
import { subDays, startOfDay, addHours, addMinutes } from 'date-fns';

const connectionString = (process.env.DATABASE_URL as string);
if (!connectionString) {
  throw new Error("DATABASE_URL must be set in environment.");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning up database...');
  await prisma.event.deleteMany();
  await prisma.project.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.orgMember.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organisation.deleteMany();

  console.log('Creating organisations and users...');
  const passwordHash = await bcryptjs.hash('password123', 10);

  // 1. Acme Corp - FREE
  const acme = await prisma.organisation.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'free',
      timezone: 'Asia/Kolkata',
    },
  });

  await prisma.user.create({
    data: {
      email: 'owner@acme.com',
      name: 'Acme Owner',
      passwordHash,
      memberships: {
        create: {
          orgId: acme.id,
          role: 'owner',
        },
      },
    },
  });

  const acmeProject = await prisma.project.create({
    data: {
      orgId: acme.id,
      name: 'Acme Store',
      domain: 'store.acme.com',
    },
  });

  // 2. TechStart - PRO
  const techStart = await prisma.organisation.create({
    data: {
      name: 'TechStart',
      slug: 'techstart',
      plan: 'pro',
      timezone: 'Asia/Kolkata',
    },
  });

  await prisma.user.create({
    data: {
      email: 'owner@techstart.io',
      name: 'Tech CEO',
      passwordHash,
      memberships: {
        create: {
          orgId: techStart.id,
          role: 'owner',
        },
      },
    },
  });

  const techProjects = await Promise.all([
    prisma.project.create({ data: { orgId: techStart.id, name: 'SaaS App', domain: 'app.techstart.io' } }),
    prisma.project.create({ data: { orgId: techStart.id, name: 'Marketing Site', domain: 'techstart.io' } }),
    prisma.project.create({ data: { orgId: techStart.id, name: 'API Docs', domain: 'docs.techstart.io' } }),
  ]);

  // 3. RetailCo - PRO
  const retailCo = await prisma.organisation.create({
    data: {
      name: 'RetailCo',
      slug: 'retailco',
      plan: 'pro',
      timezone: 'Asia/Kolkata',
    },
  });

  await prisma.user.create({
    data: {
      email: 'admin@retailco.com',
      name: 'Retail Admin',
      passwordHash,
      memberships: {
        create: {
          orgId: retailCo.id,
          role: 'owner',
        },
      },
    },
  });

  const retailProject = await prisma.project.create({
    data: {
      orgId: retailCo.id,
      name: 'E-commerce Platform',
      domain: 'shop.retailco.com',
    },
  });

  console.log('Generating 90 days of events...');
  const eventTypes = ['page_view', 'signup', 'purchase', 'button_click'];
  const allProjects = [acmeProject, ...techProjects, retailProject];

  for (const project of allProjects) {
    const eventsToCreate = [];
    console.log(`Generating events for project: ${project.name}`);

    for (let i = 0; i < 90; i++) {
      const date = subDays(new Date(), i);
      const isWeekend = [0, 6].includes(date.getDay());
      const baseDailyVolume = isWeekend ? 50 : 150;
      
      // Random volume with some growth trend for recent days
      const volume = Math.floor(baseDailyVolume * (1 + (90 - i) / 100) * (0.8 + Math.random() * 0.4));

      for (let j = 0; j < volume; j++) {
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        let revenue = 0;
        
        if (type === 'purchase') {
          revenue = Math.floor(Math.random() * 5000) + 500;
        }

        // Random time during the day
        const occurredAt = addMinutes(addHours(startOfDay(date), Math.floor(Math.random() * 24)), Math.floor(Math.random() * 60));

        eventsToCreate.push({
          projectId: project.id,
          eventType: type,
          revenue: revenue.toString(),
          occurredAt,
          properties: { session_id: `sess_${Math.random().toString(36).substring(7)}` },
        });
      }
    }

    // Bulk insert using createMany
    console.log(`  Inserting ${eventsToCreate.length} events...`);
    await prisma.event.createMany({
      data: eventsToCreate,
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
