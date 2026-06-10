import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRunStatus, ParticipantStatus } from '@prisma/client';
import { CreateOpenRunDto, OpenRunFiltersDto } from './dto/open-run.dto';

const OPEN_RUN_INCLUDE = {
  court: { select: { id: true, name: true, address: true, city: true } },
  organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
  _count: { select: { participants: { where: { status: ParticipantStatus.APPROVED } } } },
};

@Injectable()
export class OpenRunsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: OpenRunFiltersDto) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, filters.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = { status: OpenRunStatus.OPEN, isPublic: true };
    if (filters.courtId) where.courtId = filters.courtId;
    if (filters.date) where.date = new Date(filters.date);
    if (filters.upcoming) where.date = { gte: new Date() };

    const [runs, total] = await Promise.all([
      this.prisma.openRun.findMany({
        where,
        include: OPEN_RUN_INCLUDE,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
      }),
      this.prisma.openRun.count({ where }),
    ]);

    return {
      data: runs.map(this.formatRun),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string) {
    const run = await this.prisma.openRun.findUnique({
      where: { id },
      include: {
        ...OPEN_RUN_INCLUDE,
        participants: {
          where: { status: { in: [ParticipantStatus.PENDING, ParticipantStatus.APPROVED] } },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!run) throw new NotFoundException('Open Run не найден');

    if (!run.isPublic && run.organizerId !== userId) {
      const isParticipant = run.participants.some(
        (p) => p.userId === userId && p.status === ParticipantStatus.APPROVED,
      );
      if (!isParticipant) throw new ForbiddenException('Это закрытый Open Run');
    }

    return this.formatRun(run);
  }

  async create(dto: CreateOpenRunDto, organizerId: string) {
    const court = await this.prisma.court.findUnique({ where: { id: dto.courtId } });
    if (!court) throw new NotFoundException('Корт не найден');

    const run = await this.prisma.openRun.create({
      data: {
        courtId: dto.courtId,
        organizerId,
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        maxParticipants: dto.maxParticipants,
        fee: dto.fee ?? 0,
        isPublic: dto.isPublic,
        status: OpenRunStatus.OPEN,
      },
      include: OPEN_RUN_INCLUDE,
    });

    return this.formatRun(run);
  }

  async cancel(id: string, userId: string) {
    const run = await this.getRunOrFail(id);
    if (run.organizerId !== userId) throw new ForbiddenException();
    if (run.status === OpenRunStatus.CANCELLED) {
      throw new BadRequestException('Open Run уже отменён');
    }

    return this.prisma.openRun.update({
      where: { id },
      data: { status: OpenRunStatus.CANCELLED },
      include: OPEN_RUN_INCLUDE,
    });
  }

  async closeRegistration(id: string, userId: string) {
    const run = await this.getRunOrFail(id);
    if (run.organizerId !== userId) throw new ForbiddenException();
    if (run.status !== OpenRunStatus.OPEN) {
      throw new BadRequestException('Регистрация уже закрыта или Open Run отменён');
    }

    return this.prisma.openRun.update({
      where: { id },
      data: { status: OpenRunStatus.CLOSED },
      include: OPEN_RUN_INCLUDE,
    });
  }

  async join(id: string, userId: string) {
    const run = await this.prisma.openRun.findUnique({
      where: { id },
      include: {
        _count: { select: { participants: { where: { status: ParticipantStatus.APPROVED } } } },
      },
    });

    if (!run) throw new NotFoundException('Open Run не найден');
    if (run.status !== OpenRunStatus.OPEN) {
      throw new BadRequestException('Регистрация закрыта');
    }
    if (run.organizerId === userId) {
      throw new BadRequestException('Организатор не может записаться на свой Open Run');
    }

    const existing = await this.prisma.openRunParticipant.findUnique({
      where: { openRunId_userId: { openRunId: id, userId } },
    });
    if (existing) {
      if (existing.status === ParticipantStatus.CANCELLED) {
        return this.prisma.openRunParticipant.update({
          where: { id: existing.id },
          data: { status: ParticipantStatus.PENDING },
        });
      }
      throw new ConflictException('Вы уже подали заявку на этот Open Run');
    }

    const approvedCount = run._count.participants;
    if (approvedCount >= run.maxParticipants) {
      throw new BadRequestException('Нет свободных мест');
    }

    const status = run.isPublic ? ParticipantStatus.APPROVED : ParticipantStatus.PENDING;
    return this.prisma.openRunParticipant.create({
      data: { openRunId: id, userId, status },
    });
  }

  async leave(id: string, userId: string) {
    const participant = await this.prisma.openRunParticipant.findUnique({
      where: { openRunId_userId: { openRunId: id, userId } },
    });
    if (!participant) throw new NotFoundException('Вы не записаны на этот Open Run');

    await this.prisma.openRunParticipant.update({
      where: { id: participant.id },
      data: { status: ParticipantStatus.CANCELLED },
    });
  }

  async updateParticipantStatus(
    runId: string,
    participantId: string,
    status: ParticipantStatus,
    organizerId: string,
  ) {
    const run = await this.getRunOrFail(runId);
    if (run.organizerId !== organizerId) throw new ForbiddenException();

    return this.prisma.openRunParticipant.update({
      where: { id: participantId },
      data: { status },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  private async getRunOrFail(id: string) {
    const run = await this.prisma.openRun.findUnique({ where: { id } });
    if (!run) throw new NotFoundException('Open Run не найден');
    return run;
  }

  private formatRun(run: any) {
    const currentParticipants = run._count?.participants ?? 0;
    return { ...run, currentParticipants };
  }
}
