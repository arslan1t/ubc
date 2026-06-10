import { PrismaClient, NewsCategory, UserRole, AuthProvider } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding news...');

  // Создаём/находим admin-пользователя
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ubculture.uz' },
    update: {},
    create: {
      email: 'admin@ubculture.uz',
      firstName: 'UBC',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      provider: AuthProvider.LOCAL,
      passwordHash: '$2b$10$placeholder.hash.not.for.login',
      isActive: true,
    },
  });

  const now = new Date();

  const articles = [
    // ── Статья 1: Предстоящие турниры FIBA 3x3 ──
    {
      title: 'Июнь 2026: Четыре турнира 3x3 в Ташкенте — полное расписание',
      slug: 'june-2026-fiba-3x3-tournaments-tashkent',
      category: NewsCategory.TOURNAMENTS,
      excerpt:
        'Насыщенный июнь для баскетбольного Узбекистана: четыре официальных турнира FIBA 3x3 пройдут в Ташкенте — от молодёжных до открытых.',
      content: `
Июнь 2026 года обещает стать одним из самых насыщенных месяцев для узбекского баскетбола. Организация **3x3Uzbekistan** подготовила сразу четыре официальных турнира FIBA 3x3 — все в Ташкенте, все с разными возрастными категориями.

---

## 8–9 июня — YANGI O'ZBEKISTON TALABALARI OLIMPIADASI

Открывает серию студенческая олимпиада — баскетбольный 3x3 турнир в рамках Спортивных игр студентов «Нового Узбекистана». Соревнования пройдут среди мужских и женских команд в открытой категории.

[Регистрация и подробности →](https://play.fiba3x3.com/events/64e815c6-8f24-43d4-94ea-7be8dc2ed591)

---

## 14 июня — Summer Cup 2026

Молодёжный турнир с тремя возрастными категориями: **U13**, **U15** и **U18**. Отличная возможность для молодых игроков получить официальный FIBA-опыт и рейтинговые очки.

[Регистрация и подробности →](https://play.fiba3x3.com/events/ba941ed1-4925-4585-9d60-570b9362772d)

---

## 21 июня — Open Cup Kids

Ещё один молодёжный старт — **U13**, **U15**, **U18**. Серия «Open Cup» традиционно собирает команды со всего Узбекистана и помогает выявить таланты для национальных сборных.

[Регистрация и подробности →](https://play.fiba3x3.com/events/a13fd8a7-c38e-4ead-ac6f-c06990b0bf74)

---

## 28 июня — KINGS OF THE COURT

Финальный аккорд июня — взрослый турнир **Open (18+)** и юношеская категория **U18**. «Kings of the Court» — один из самых престижных клубных турниров сезона в Узбекистане.

[Регистрация и подробности →](https://play.fiba3x3.com/events/ff56e58c-9773-4a84-9c8a-9a8d53464be9)

---

Следи за расписанием и результатами на платформе UBC и официальном сайте FIBA 3x3.
      `.trim(),
      isPublished: true,
      publishedAt: new Date('2026-06-07T10:00:00Z'),
      authorId: admin.id,
    },

    // ── Статья 2: Namangan team в Алмате ──
    {
      title: 'Namangan 3x3 завоевала два серебра на турнире в Алмате',
      slug: 'namangan-3x3-almaty-june-2026-silver',
      category: NewsCategory.TOURNAMENTS,
      excerpt:
        'Команда Namangan 3x3 отметилась яркой игрой на турнире в Алмате 1 июня: оба состава — U18 и U21 — взяли серебро, а хайлайты признаны лучшими на турнире.',
      content: `
1 июня 2026 года команда **Namangan 3x3** выступила на турнире в Алмате (Казахстан) сразу двумя составами — юношеским **U18** и молодёжным **U21**. Оба состава дошли до финала и завоевали **серебряные медали**.

## Составы

**U18**
- Ibragim Avazov
- Isa Ismail-Akhunov
- Ali Toychiyev
- Жан Насыров

**U21**
- Ibragim Avazov
- Алдияр Baurzhan
- Ali Toychiyev
- Marat Yanbayev

## Лучшие хайлайты турнира

Помимо медалей, Namangan 3x3 запомнилась зрелищной игрой — видео команды было признано **лучшими хайлайтами** всего турнира.

Смотри моменты:
- [TikTok](https://www.tiktok.com/@ibrohim.2real/video/7646587944328776967)
- [Instagram](https://www.instagram.com/p/DZCGIgToM-z/)

[Официальные результаты турнира →](https://play.fiba3x3.com/events/0bc2dfb7-4bff-4d72-be38-359d33d2881f)

---

Намангания — живёт! Следим за командой в новом сезоне.
      `.trim(),
      isPublished: true,
      publishedAt: new Date('2026-06-02T12:00:00Z'),
      authorId: admin.id,
    },

    // ── Статья 3: Турнир 1 на 1 ──
    {
      title: 'UBC провёл международный турнир 1 на 1: призовой фонд $150',
      slug: 'ubc-1v1-international-june-6-2026',
      category: NewsCategory.AMATEUR,
      excerpt:
        '6 июня на площадке UBC прошёл турнир 1 на 1 с участием гостей из Казахстана и Таджикистана. Призовой фонд составил $150.',
      content: `
6 июня 2026 года UBC организовал **международный турнир 1 на 1** — формат, который набирает популярность в уличном баскетболе по всей Центральной Азии.

## Гости из трёх стран

На турнир приехали игроки из **Казахстана** и **Таджикистана**, что сделало соревнование поистине международным. Узбекские участники принимали вызов на своей площадке.

## Призовой фонд

Победитель забрал **$150** — серьёзная мотивация для уличного баскетбола.

## Атмосфера

Турнир собрал зрителей и болельщиков, превратившись в настоящий праздник стритбола. Смотри моменты в нашем Instagram:

[Посмотреть →](https://www.instagram.com/p/DZNWw8ZMltf/)

---

Следи за анонсами следующих ивентов в нашем [Telegram](https://t.me/ubculture) и [Instagram](https://www.instagram.com/ubcbasketbal/).
      `.trim(),
      isPublished: true,
      publishedAt: new Date('2026-06-06T20:00:00Z'),
      authorId: admin.id,
    },
  ];

  for (const article of articles) {
    await prisma.news.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
    console.log(`  ✓ ${article.title}`);
  }

  console.log('Done!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
