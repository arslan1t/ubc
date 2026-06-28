import { Injectable, OnModuleInit, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
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
  _count: { select: { registrations: true } },
};

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);

  constructor(private prisma: PrismaService) {}

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
        registrations: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            userId: true,
            createdAt: true,
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        _count: { select: { registrations: true } },
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

  async register(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });
    if (!event) throw new NotFoundException('Турнир не найден');

    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      throw new BadRequestException('Регистрация закрыта — нет свободных мест');
    }

    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (existing) throw new ConflictException('Вы уже зарегистрированы на этот турнир');

    return this.prisma.eventRegistration.create({ data: { eventId, userId } });
  }

  async unregister(eventId: string, userId: string) {
    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!existing) throw new NotFoundException('Регистрация не найдена');
    await this.prisma.eventRegistration.delete({ where: { id: existing.id } });
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
