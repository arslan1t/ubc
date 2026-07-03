import { Injectable, OnModuleInit, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { randomInt } from 'crypto';
import { RegistrationStatus, MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEventDto, UpdateEventDto, RegisterEventDto, UpdateMatchDto } from './dto/event.dto';
import { DEFAULT_TOURNAMENT } from './default-event.data';
import slugify from 'slug';

const EVENT_LIST_SELECT = {
  id: true,
  slug: true,
  title: true,
  status: true,
  startDate: true,
  location: true,
  coverUrl: true,
  maxParticipants: true,
  _count: { select: { registrations: { where: { status: RegistrationStatus.APPROVED } } } },
};

const MATCH_PLAYER_SELECT = {
  select: { id: true, firstName: true, lastName: true, avatarUrl: true },
};

const MAX_BRACKET = 32;

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private notifications: NotificationsService,
  ) {}

  // Production-safe default-data bootstrap: runs on every API start, inserts
  // the default tournament only if it doesn't already exist (upsert on slug).
  async onModuleInit() {
    try {
      await this.prisma.event.upsert({
        where: { slug: DEFAULT_TOURNAMENT.slug },
        update: {},
        create: DEFAULT_TOURNAMENT,
      });
    } catch (error) {
      this.logger.error('Failed to ensure default tournament exists', error as Error);
    }
  }

  async findAll() {
    const events = await this.prisma.event.findMany({
      select: EVENT_LIST_SELECT,
      orderBy: { startDate: 'asc' },
    });
    return events.map(this.mapList);
  }

  async findOne(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        gallery: { orderBy: { order: 'asc' } },
        // Only enrolled (reviewed + approved) players are public.
        registrations: {
          where: { status: RegistrationStatus.APPROVED },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        _count: {
          select: { registrations: { where: { status: RegistrationStatus.APPROVED } } },
        },
      },
    });
    if (!event) throw new NotFoundException('Турнир не найден');
    return {
      ...event,
      registrationCount: event._count.registrations,
      _count: undefined,
    };
  }

  async create(dto: CreateEventDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const exists = await this.prisma.event.findUnique({ where: { slug } });
    if (exists) throw new ConflictException('Турнир с таким slug уже существует');

    return this.prisma.event.create({
      data: { ...dto, slug, startDate: new Date(dto.startDate) },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Турнир не найден');

    const data: Record<string, unknown> = { ...dto };
    if (dto.slug) data.slug = slugify(dto.slug);
    if (dto.startDate) data.startDate = new Date(dto.startDate);

    return this.prisma.event.update({ where: { id }, data });
  }

  async remove(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Турнир не найден');
    await this.prisma.event.delete({ where: { id } });
  }

  /** Player files an application (PENDING) — enrolled only after admin review. */
  async register(eventId: string, userId: string, dto: RegisterEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: { where: { status: RegistrationStatus.APPROVED } } },
        },
      },
    });
    if (!event) throw new NotFoundException('Турнир не найден');

    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      throw new BadRequestException('Регистрация закрыта — все места уже заняты');
    }

    if (!dto.highlightUrl?.trim() && !dto.instagram?.trim()) {
      throw new BadRequestException('Укажи ссылку на видео-хайлайт или свой Instagram');
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (existing) {
      if (existing.status === RegistrationStatus.REJECTED) {
        // Re-apply after rejection: update the application and put it back in review.
        return this.prisma.eventRegistration.update({
          where: { id: existing.id },
          data: {
            status: RegistrationStatus.PENDING,
            height: dto.height ?? null,
            weight: dto.weight ?? null,
            age: dto.age ?? null,
            highlightUrl: dto.highlightUrl?.trim() || null,
            instagram: this.cleanInstagram(dto.instagram),
            reviewNote: null,
          },
        });
      }
      throw new ConflictException('Заявка уже отправлена');
    }

    return this.prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        height: dto.height ?? null,
        weight: dto.weight ?? null,
        age: dto.age ?? null,
        highlightUrl: dto.highlightUrl?.trim() || null,
        instagram: this.cleanInstagram(dto.instagram),
      },
    });
  }

  private cleanInstagram(raw?: string): string | null {
    if (!raw) return null;
    const v = raw
      .trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/^@+/, '')
      .split(/[/?#]/)[0]
      .trim();
    return v || null;
  }

  async myRegistration(eventId: string, userId: string) {
    return this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
  }

  async unregister(eventId: string, userId: string) {
    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!existing) throw new NotFoundException('Регистрация не найдена');
    await this.prisma.eventRegistration.delete({ where: { id: existing.id } });
  }

  /** Admin approves/rejects an application; player gets notified. */
  async reviewRegistration(
    eventId: string,
    registrationId: string,
    status: 'APPROVED' | 'REJECTED',
    note?: string,
  ) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: { event: { select: { id: true, slug: true, title: true, maxParticipants: true } } },
    });
    if (!reg || reg.eventId !== eventId) throw new NotFoundException('Заявка не найдена');

    if (status === 'APPROVED') {
      const approved = await this.prisma.eventRegistration.count({
        where: { eventId, status: RegistrationStatus.APPROVED },
      });
      if (reg.event.maxParticipants && approved >= reg.event.maxParticipants) {
        throw new BadRequestException('Все места уже заняты — увеличь лимит участников или отклони заявку');
      }
    }

    const updated = await this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status: status as RegistrationStatus, reviewNote: note ?? null },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, telegramUsername: true } },
      },
    });

    if (status === 'APPROVED') {
      await this.notifications.create(
        reg.userId,
        'EVENT_REGISTRATION_APPROVED',
        `Ты в игре! Заявка на «${reg.event.title}» одобрена`,
        'Смотри сетку и время своего матча на странице турнира.',
        `/events/${reg.event.slug}`,
      );
    } else {
      await this.notifications.create(
        reg.userId,
        'EVENT_REGISTRATION_REJECTED',
        `Заявка на «${reg.event.title}» отклонена`,
        note ?? 'Можно подать заявку ещё раз, дополнив анкету.',
        `/events/${reg.event.slug}`,
      );
    }

    return updated;
  }

  /** Admin removes a registration entirely (spam, duplicates, player dropped out). */
  async deleteRegistration(eventId: string, registrationId: string) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
    });
    if (!reg || reg.eventId !== eventId) throw new NotFoundException('Заявка не найдена');
    await this.prisma.eventRegistration.delete({ where: { id: registrationId } });
  }

  // ─── Bracket ───

  /** Build the bracket from approved players: shuffle, seed round 1, auto-advance byes. */
  async generateBracket(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Турнир не найден');

    const approved = await this.prisma.eventRegistration.findMany({
      where: { eventId, status: RegistrationStatus.APPROVED },
      orderBy: { createdAt: 'asc' },
      take: MAX_BRACKET,
      select: { userId: true },
    });
    if (approved.length < 2) {
      throw new BadRequestException('Нужно минимум 2 одобренных участника');
    }

    // Fisher–Yates with crypto randomness — fair seeding.
    const players = approved.map((r) => r.userId);
    for (let i = players.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [players[i], players[j]] = [players[j], players[i]];
    }

    let size = 2;
    while (size < players.length) size *= 2; // 2, 4, 8, 16, 32
    const totalRounds = Math.log2(size);
    // Spread byes across round-1 matches so every match has at least one player
    // (size is the minimal power of two ≥ N, hence byes ≤ matches in round 1).
    const byesCount = size - players.length;

    await this.prisma.eventMatch.deleteMany({ where: { eventId } });

    // Create every round upfront so the client can render the whole tree.
    const matches: Array<{
      eventId: string;
      round: number;
      slot: number;
      player1Id: string | null;
      player2Id: string | null;
      winnerId: string | null;
      status: MatchStatus;
    }> = [];

    const queue = [...players];
    for (let round = 1; round <= totalRounds; round++) {
      const count = size / 2 ** round;
      for (let slot = 0; slot < count; slot++) {
        if (round === 1) {
          const isBye = slot < byesCount;
          const p1 = queue.shift() ?? null;
          const p2 = isBye ? null : (queue.shift() ?? null);
          matches.push({
            eventId,
            round,
            slot,
            player1Id: p1,
            player2Id: p2,
            winnerId: isBye ? p1 : null,
            status: isBye ? MatchStatus.COMPLETED : MatchStatus.SCHEDULED,
          });
        } else {
          matches.push({
            eventId,
            round,
            slot,
            player1Id: null,
            player2Id: null,
            winnerId: null,
            status: MatchStatus.SCHEDULED,
          });
        }
      }
    }

    await this.prisma.eventMatch.createMany({ data: matches });

    // Push bye winners into round 2.
    const byes = matches.filter((m) => m.round === 1 && m.winnerId);
    for (const bye of byes) {
      await this.advanceWinner(eventId, 1, bye.slot, bye.winnerId!, totalRounds);
    }

    return this.getBracket(eventId);
  }

  async getBracket(eventId: string) {
    const matches = await this.prisma.eventMatch.findMany({
      where: { eventId },
      orderBy: [{ round: 'asc' }, { slot: 'asc' }],
      include: { player1: MATCH_PLAYER_SELECT, player2: MATCH_PLAYER_SELECT },
    });
    return { matches, generatedAt: matches[0]?.createdAt ?? null };
  }

  async updateMatch(eventId: string, matchId: string, dto: UpdateMatchDto) {
    const match = await this.prisma.eventMatch.findUnique({ where: { id: matchId } });
    if (!match || match.eventId !== eventId) throw new NotFoundException('Матч не найден');

    if (dto.winnerId && dto.winnerId !== match.player1Id && dto.winnerId !== match.player2Id) {
      throw new BadRequestException('Победитель должен быть одним из игроков матча');
    }
    if (dto.status === MatchStatus.COMPLETED && !dto.winnerId && !match.winnerId) {
      throw new BadRequestException('Укажи победителя, чтобы завершить матч');
    }

    const totalRounds = await this.prisma.eventMatch
      .aggregate({ where: { eventId }, _max: { round: true } })
      .then((r) => r._max.round ?? 1);

    // Guard against corrupting later rounds that already finished.
    if (dto.winnerId && dto.winnerId !== match.winnerId && match.round < totalRounds) {
      const next = await this.prisma.eventMatch.findUnique({
        where: {
          eventId_round_slot: {
            eventId,
            round: match.round + 1,
            slot: Math.floor(match.slot / 2),
          },
        },
      });
      if (next?.status === MatchStatus.COMPLETED) {
        throw new BadRequestException('Следующий матч уже завершён — сначала сбрось его результат');
      }
    }

    const updated = await this.prisma.eventMatch.update({
      where: { id: matchId },
      data: {
        score1: dto.score1,
        score2: dto.score2,
        status: dto.status,
        winnerId: dto.winnerId,
      },
      include: { player1: MATCH_PLAYER_SELECT, player2: MATCH_PLAYER_SELECT },
    });

    if (dto.winnerId && match.round < totalRounds) {
      await this.advanceWinner(eventId, match.round, match.slot, dto.winnerId, totalRounds);
    }

    return updated;
  }

  private async advanceWinner(
    eventId: string,
    round: number,
    slot: number,
    winnerId: string,
    totalRounds: number,
  ) {
    if (round >= totalRounds) return;
    const nextSlot = Math.floor(slot / 2);
    const position = slot % 2 === 0 ? 'player1Id' : 'player2Id';
    await this.prisma.eventMatch.update({
      where: { eventId_round_slot: { eventId, round: round + 1, slot: nextSlot } },
      data: { [position]: winnerId },
    });
  }

  async resetBracket(eventId: string) {
    await this.prisma.eventMatch.deleteMany({ where: { eventId } });
  }

  async uploadCover(id: string, buffer: Buffer, mimeType?: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Турнир не найден');

    const result = await this.storage.uploadImage(buffer, `events/${id}/cover`, mimeType);
    return this.prisma.event.update({
      where: { id },
      data: { coverUrl: result.url },
    });
  }

  async addGalleryImage(id: string, buffer: Buffer, mimeType?: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Турнир не найден');

    const result = await this.storage.uploadImage(buffer, `events/${id}/gallery`, mimeType);
    const count = await this.prisma.eventImage.count({ where: { eventId: id } });

    return this.prisma.eventImage.create({
      data: {
        eventId: id,
        url: result.url,
        mediumUrl: result.mediumUrl,
        thumbnailUrl: result.thumbnailUrl,
        storageKey: result.key,
        order: count,
      },
    });
  }

  async deleteGalleryImage(imageId: string) {
    const image = await this.prisma.eventImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Фото не найдено');

    await this.storage.deleteFile(image.storageKey);
    await this.storage.deleteMany([
      image.storageKey.replace('original', 'medium'),
      image.storageKey.replace('original', 'thumbnail'),
    ]);
    await this.prisma.eventImage.delete({ where: { id: imageId } });
  }

  async registrations(eventId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Турнир не найден');

    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, telegramUsername: true } },
      },
    });
  }

  private mapList(event: { _count: { registrations: number } } & Record<string, unknown>) {
    const { _count, ...rest } = event;
    return { ...rest, registrationCount: _count.registrations };
  }
}
