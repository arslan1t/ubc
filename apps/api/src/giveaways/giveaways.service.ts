import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { GiveawayStatus, RegistrationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateGiveawayDto, UpdateGiveawayDto } from './dto/giveaway.dto';

const ENTRY_USER_SELECT = {
  select: { id: true, firstName: true, lastName: true, avatarUrl: true },
};

@Injectable()
export class GiveawaysService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private notifications: NotificationsService,
  ) {}

  async findAll() {
    const giveaways = await this.prisma.giveaway.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], // OPEN first
      include: {
        winner: ENTRY_USER_SELECT,
        _count: {
          select: { entries: { where: { status: RegistrationStatus.APPROVED } } },
        },
      },
    });
    return giveaways.map(({ _count, ...g }) => ({ ...g, poolCount: _count.entries }));
  }

  /** Public detail — the wheel pool is only the APPROVED entries. */
  async findOne(id: string) {
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id },
      include: {
        winner: ENTRY_USER_SELECT,
        entries: {
          where: { status: RegistrationStatus.APPROVED },
          orderBy: { createdAt: 'asc' },
          select: { id: true, userId: true, createdAt: true, user: ENTRY_USER_SELECT },
        },
      },
    });
    if (!giveaway) throw new NotFoundException('Розыгрыш не найден');
    return { ...giveaway, poolCount: giveaway.entries.length };
  }

  /** Player applies to join — lands in the review queue, not in the pool. */
  async enter(id: string, userId: string, comment?: string) {
    const giveaway = await this.prisma.giveaway.findUnique({ where: { id } });
    if (!giveaway) throw new NotFoundException('Розыгрыш не найден');
    if (giveaway.status !== GiveawayStatus.OPEN) {
      throw new BadRequestException('Розыгрыш уже завершён');
    }

    const existing = await this.prisma.giveawayEntry.findUnique({
      where: { giveawayId_userId: { giveawayId: id, userId } },
    });
    if (existing) {
      if (existing.status === RegistrationStatus.REJECTED) {
        // Re-apply after rejection.
        return this.prisma.giveawayEntry.update({
          where: { id: existing.id },
          data: { status: RegistrationStatus.PENDING, comment: comment?.trim() || null },
        });
      }
      throw new ConflictException('Заявка уже отправлена');
    }

    return this.prisma.giveawayEntry.create({
      data: { giveawayId: id, userId, comment: comment?.trim() || null },
    });
  }

  async myEntry(id: string, userId: string) {
    return this.prisma.giveawayEntry.findUnique({
      where: { giveawayId_userId: { giveawayId: id, userId } },
    });
  }

  async leave(id: string, userId: string) {
    const giveaway = await this.prisma.giveaway.findUnique({ where: { id } });
    if (!giveaway) throw new NotFoundException('Розыгрыш не найден');
    if (giveaway.status !== GiveawayStatus.OPEN) {
      throw new BadRequestException('Розыгрыш уже завершён');
    }
    const existing = await this.prisma.giveawayEntry.findUnique({
      where: { giveawayId_userId: { giveawayId: id, userId } },
    });
    if (!existing) throw new NotFoundException('Ты не участвуешь в этом розыгрыше');
    await this.prisma.giveawayEntry.delete({ where: { id: existing.id } });
  }

  // ─── Admin ───

  create(dto: CreateGiveawayDto) {
    return this.prisma.giveaway.create({ data: dto });
  }

  async update(id: string, dto: UpdateGiveawayDto) {
    const giveaway = await this.prisma.giveaway.findUnique({ where: { id } });
    if (!giveaway) throw new NotFoundException('Розыгрыш не найден');
    return this.prisma.giveaway.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const giveaway = await this.prisma.giveaway.findUnique({ where: { id } });
    if (!giveaway) throw new NotFoundException('Розыгрыш не найден');
    await this.prisma.giveaway.delete({ where: { id } });
  }

  async uploadCover(
    id: string,
    buffer: Buffer,
    mimeType?: string,
    kind: 'cover' | 'banner' = 'cover',
  ) {
    const giveaway = await this.prisma.giveaway.findUnique({ where: { id } });
    if (!giveaway) throw new NotFoundException('Розыгрыш не найден');
    const result = await this.storage.uploadImage(buffer, `giveaways/${id}/${kind}`, mimeType);
    return this.prisma.giveaway.update({
      where: { id },
      data: kind === 'banner' ? { bannerUrl: result.url } : { coverUrl: result.url },
    });
  }

  /** Full entries list for the review queue. */
  async entries(id: string) {
    const giveaway = await this.prisma.giveaway.findUnique({ where: { id } });
    if (!giveaway) throw new NotFoundException('Розыгрыш не найден');
    return this.prisma.giveawayEntry.findMany({
      where: { giveawayId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            telegramUsername: true,
            instagramUsername: true,
          },
        },
      },
    });
  }

  async reviewEntry(
    giveawayId: string,
    entryId: string,
    status: 'APPROVED' | 'REJECTED',
    note?: string,
  ) {
    const entry = await this.prisma.giveawayEntry.findUnique({
      where: { id: entryId },
      include: { giveaway: { select: { id: true, title: true, status: true } } },
    });
    if (!entry || entry.giveawayId !== giveawayId) throw new NotFoundException('Заявка не найдена');
    if (entry.giveaway.status !== GiveawayStatus.OPEN) {
      throw new BadRequestException('Розыгрыш уже завершён');
    }

    const updated = await this.prisma.giveawayEntry.update({
      where: { id: entryId },
      data: { status: status as RegistrationStatus },
      include: { user: ENTRY_USER_SELECT },
    });

    if (status === 'APPROVED') {
      await this.notifications.create(
        entry.userId,
        'GIVEAWAY_ENTRY_APPROVED',
        `Ты в пуле розыгрыша «${entry.giveaway.title}»`,
        'Заявка проверена и одобрена. Следи за колесом — удачи!',
        `/giveaways/${giveawayId}`,
      );
    } else {
      await this.notifications.create(
        entry.userId,
        'GIVEAWAY_ENTRY_REJECTED',
        `Заявка на розыгрыш «${entry.giveaway.title}» отклонена`,
        note ?? 'Проверь условия участия и подай заявку снова.',
        `/giveaways/${giveawayId}`,
      );
    }

    return updated;
  }

  /** Admin removes an entry entirely. */
  async deleteEntry(giveawayId: string, entryId: string) {
    const entry = await this.prisma.giveawayEntry.findUnique({ where: { id: entryId } });
    if (!entry || entry.giveawayId !== giveawayId) throw new NotFoundException('Заявка не найдена');
    await this.prisma.giveawayEntry.delete({ where: { id: entryId } });
  }

  /** Server-side draw with crypto randomness — the wheel animation lands on this winner. */
  async draw(id: string) {
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id },
      include: {
        entries: {
          where: { status: RegistrationStatus.APPROVED },
          orderBy: { createdAt: 'asc' },
          select: { userId: true },
        },
      },
    });
    if (!giveaway) throw new NotFoundException('Розыгрыш не найден');
    if (giveaway.status !== GiveawayStatus.OPEN) {
      throw new BadRequestException('Победитель уже выбран');
    }
    if (!giveaway.entries.length) {
      throw new BadRequestException('В пуле нет одобренных участников');
    }

    const winnerIndex = randomInt(giveaway.entries.length);
    const winnerId = giveaway.entries[winnerIndex].userId;

    const updated = await this.prisma.giveaway.update({
      where: { id },
      data: { status: GiveawayStatus.COMPLETED, winnerId, drawnAt: new Date() },
      include: { winner: ENTRY_USER_SELECT },
    });

    await this.notifications.create(
      winnerId,
      'GIVEAWAY_WON',
      `🎉 Ты выиграл: ${giveaway.prize}`,
      `Поздравляем! Ты победитель розыгрыша «${giveaway.title}». Мы свяжемся с тобой.`,
      `/giveaways/${id}`,
    );

    return { ...updated, winnerIndex };
  }
}
