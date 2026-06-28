import { PrismaClient, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding tournament event...');

  const event = await prisma.event.upsert({
    where: { slug: '1v1-july-4' },
    update: {},
    create: {
      slug: '1v1-july-4',
      title: '1v1 Tournament',
      status: EventStatus.REGISTRATION_OPEN,
      startDate: new Date('2026-07-04T15:00:00+05:00'),
      location: 'UBC Court',
      address: 'Ташкент, ул. Мирзо-Улугбека (уточняется)',
      coverUrl: '/main.png',
      description:
        'Главный летний турнир UBC: один на один, без компромиссов. Регистрируйся и проверь себя против лучших уличных игроков города.',
      rules:
        'Игра до 11 очков с разницей в 2. Тайбрейк — до 15. Одиночный матч, без замен. Победитель выходит в следующий круг по олимпийской системе.',
      prizePool: 'Призовой фонд уточняется. Победитель и финалист получат денежные призы и подарки от партнёров турнира.',
      schedule: [
        { time: '15:00', title: 'Регистрация и разминка' },
        { time: '16:00', title: 'Старт 1/8 финала' },
        { time: '18:00', title: 'Полуфиналы' },
        { time: '19:00', title: 'Финал' },
      ],
      sponsors: [],
      faq: [
        {
          question: 'Кто может участвовать?',
          answer: 'Любой зарегистрированный пользователь платформы UBC.',
        },
        {
          question: 'Нужно ли платить за участие?',
          answer: 'Нет, участие бесплатное.',
        },
        {
          question: 'Что взять с собой?',
          answer: 'Спортивную форму, кроссовки и хорошее настроение.',
        },
      ],
      maxParticipants: 32,
    },
  });

  console.log(`  ✓ ${event.title} (${event.slug})`);
  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
