import { PrismaClient, UserRole, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // ─── Admin account ───
  const password = 'UBC_admin_2026!';
  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ubculture.uz' },
    update: { passwordHash: hash, role: UserRole.ADMIN },
    create: {
      email: 'admin@ubculture.uz',
      firstName: 'UBC',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      provider: AuthProvider.LOCAL,
      passwordHash: hash,
      isActive: true,
    },
  });
  console.log(`✓ Admin: admin@ubculture.uz / ${password}`);

  // ─── Namangan news: обложка + галерея + новый хайлайт ───
  const namangan = await prisma.news.findUnique({
    where: { slug: 'namangan-3x3-almaty-june-2026-silver' },
  });

  if (namangan) {
    // Обложка
    await prisma.news.update({
      where: { id: namangan.id },
      data: {
        coverUrl: '/namangan-1.png',
        content: namangan.content.replace(
          '- [Instagram](https://www.instagram.com/p/DZCGIgToM-z/)',
          '- [Instagram — хайлайты 1](https://www.instagram.com/p/DZCGIgToM-z/)\n- [Instagram — хайлайты 2](https://www.instagram.com/p/DZCzE8cMvhI/)',
        ),
      },
    });

    // Галерея — удаляем старые и создаём свежие
    await prisma.newsImage.deleteMany({ where: { newsId: namangan.id } });

    const images = [
      { file: '/namangan-1.png', caption: 'Namangan 3x3 — U18 в Алмате' },
      { file: '/namangan-2.png', caption: 'Namangan 3x3 — моменты турнира' },
      { file: '/namangan-3.png', caption: 'Namangan 3x3 — серебро U21' },
    ];

    for (let i = 0; i < images.length; i++) {
      await prisma.newsImage.create({
        data: {
          newsId: namangan.id,
          url: images[i].file,
          mediumUrl: images[i].file,
          thumbnailUrl: images[i].file,
          storageKey: `local${images[i].file}`,
          caption: images[i].caption,
          order: i,
        },
      });
    }
    console.log('✓ Namangan news: обложка + 3 фото + новый хайлайт');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
