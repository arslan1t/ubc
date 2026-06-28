import { PrismaClient } from '@prisma/client';
import { DEFAULT_TOURNAMENT } from '../src/events/default-event.data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding tournament event...');

  const event = await prisma.event.upsert({
    where: { slug: DEFAULT_TOURNAMENT.slug },
    update: {},
    create: DEFAULT_TOURNAMENT,
  });

  console.log(`  ✓ ${event.title} (${event.slug})`);
  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
