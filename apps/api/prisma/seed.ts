import { PrismaClient, CourtType, CourtSurface } from '@prisma/client';

const prisma = new PrismaClient();

const courts = [
  {
    name: 'Ташкент Сити',
    slug: 'tashkent-city',
    address: 'Ташкент Сити, ул. Амира Темура',
    district: 'Мирзо-Улугбекский',
    city: 'Ташкент',
    latitude: 41.317958,
    longitude: 69.247394,
    type: CourtType.OUTDOOR,
    surface: CourtSurface.ASPHALT,
    isFree: true,
    hasLighting: true,
    hasChangingRooms: false,
    hoops: 4,
    description:
      'Бесплатный открытый корт в деловом центре Ташкент Сити. Асфальтовое покрытие, 4 баскетбольных кольца. Идеально для стритбола и Pickup Games.',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Транспортный университет — Крытый зал',
    slug: 'tashkent-transport-university-indoor',
    address: 'Ташкентский государственный транспортный университет, ул. Адылходжаева 1',
    district: 'Юнусабадский',
    city: 'Ташкент',
    latitude: 41.276992,
    longitude: 69.283978,
    type: CourtType.INDOOR,
    surface: CourtSurface.HARDWOOD,
    isFree: false,
    hasLighting: true,
    hasChangingRooms: true,
    hoops: 4,
    description:
      'Закрытый спортивный зал Ташкентского государственного транспортного университета. Паркетное покрытие, раздевалки. Аренда по расписанию.',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Транспортный университет — Открытый корт',
    slug: 'tashkent-transport-university-outdoor',
    address: 'Ташкентский государственный транспортный университет, ул. Адылходжаева 1',
    district: 'Юнусабадский',
    city: 'Ташкент',
    latitude: 41.275574,
    longitude: 69.280855,
    type: CourtType.OUTDOOR,
    surface: CourtSurface.ASPHALT,
    isFree: true,
    hasLighting: false,
    hasChangingRooms: false,
    hoops: 2,
    description:
      'Бесплатный открытый корт на территории Транспортного университета. Асфальтовое покрытие, доступен в дневное время.',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Новый Узбекистан — Крытый зал',
    slug: 'new-uzbekistan-indoor',
    address: 'Парк Новый Узбекистан',
    district: 'Мирзо-Улугбекский',
    city: 'Ташкент',
    latitude: 41.322115,
    longitude: 69.422495,
    type: CourtType.INDOOR,
    surface: CourtSurface.HARDWOOD,
    isFree: false,
    hasLighting: true,
    hasChangingRooms: true,
    hoops: 4,
    description:
      'Современный крытый баскетбольный зал в парке Новый Узбекистан. Профессиональное паркетное покрытие, полное освещение, раздевалки. Платный доступ.',
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Новый Узбекистан — Открытый корт',
    slug: 'new-uzbekistan-outdoor',
    address: 'Парк Новый Узбекистан',
    district: 'Мирзо-Улугбекский',
    city: 'Ташкент',
    latitude: 41.321009,
    longitude: 69.421823,
    type: CourtType.OUTDOOR,
    surface: CourtSurface.ASPHALT,
    isFree: true,
    hasLighting: false,
    hasChangingRooms: false,
    hoops: 2,
    description:
      'Бесплатный открытый баскетбольный корт в парке Новый Узбекистан. Отличное место для игры на свежем воздухе с красивым видом на парк.',
    isVerified: true,
    isActive: true,
  },
];

async function main() {
  console.log('Seeding courts...');

  for (const court of courts) {
    await prisma.court.upsert({
      where: { slug: court.slug },
      update: court,
      create: court,
    });
    console.log(`  ✓ ${court.name}`);
  }

  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
