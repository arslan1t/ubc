import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Маппинг: slug корта → фото
const COURT_IMAGES: Record<string, { cover: string; caption: string }> = {
  'tashkent-city': {
    cover: '/court-tashkent-city.jpg',
    caption: 'Открытый корт Ташкент Сити',
  },
  'tashkent-transport-university-indoor': {
    cover: '/court-transport.jpg',
    caption: 'Крытый зал Транспортного университета',
  },
  'tashkent-transport-university-outdoor': {
    cover: '/court-transport.jpg',
    caption: 'Открытый корт Транспортного университета',
  },
  'new-uzbekistan-indoor': {
    cover: '/court-new-uzbekistan.jpg',
    caption: 'Крытый зал парка Новый Узбекистан',
  },
  'new-uzbekistan-outdoor': {
    cover: '/court-geodesy.jpg',
    caption: 'Открытый корт Новый Узбекистан',
  },
};

async function main() {
  console.log('Seeding court images...');

  for (const [slug, img] of Object.entries(COURT_IMAGES)) {
    const court = await prisma.court.findUnique({ where: { slug } });
    if (!court) { console.log(`  ⚠ Not found: ${slug}`); continue; }

    // Удаляем старые изображения
    await prisma.courtImage.deleteMany({ where: { courtId: court.id } });

    // Обложка в поле images
    await prisma.courtImage.create({
      data: {
        courtId: court.id,
        url: img.cover,
        mediumUrl: img.cover,
        thumbnailUrl: img.cover,
        storageKey: `local${img.cover}`,
        isPrimary: true,
        order: 0,
      },
    });

    console.log(`  ✓ ${slug}`);
  }

  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
