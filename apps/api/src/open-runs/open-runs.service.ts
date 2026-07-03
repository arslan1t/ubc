import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { OpenRunStatus, ParticipantStatus, UserRole } from '@prisma/client';
import { CreateOpenRunDto, UpdateOpenRunDto, OpenRunFiltersDto } from './dto/open-run.dto';
import { ROLE_RANK } from '../common/guards/roles.guard';

const COUNTED_STATUSES = [ParticipantStatus.APPROVED, ParticipantStatus.WAITLISTED];

const OPEN_RUN_INCLUDE = {
  court: { select: { id: true, name: true, address: true, city: true } },
  organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
  participants: {
    where: { status: { in: COUNTED_STATUSES } },
    select: { status: true },
  },
};

@Injectable()
export class OpenRunsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findAll(filters: OpenRunFiltersDto) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, filters.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = { status: OpenRunStatus.OPEN, isPublic: true };
    if (filters.courtId) where.courtId = filters.courtId;
    if (filters.date) where.date = new Date(filters.date);
    if (filters.upcoming) where.date = { gte: new Date() };
    if (filters.skillLevel) where.skillLevel = filters.skillLevel;
    if (filters.isFree === 'true') where.fee = 0;
    if (filters.isFree === 'false') where.fee = { gt: 0 };

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

  async adminFindAll(filters: OpenRunFiltersDto) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, filters.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.courtId) where.courtId = filters.courtId;
    if (filters.date) where.date = new Date(filters.date);

    const [runs, total] = await Promise.all([
      this.prisma.openRun.findMany({
        where,
        include: OPEN_RUN_INCLUDE,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
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

  async adminCancel(id: string) {
    const run = await this.getRunOrFail(id);
    if (run.status === OpenRunStatus.CANCELLED) {
      throw new BadRequestException('Игра уже отменена');
    }

    return this.prisma.openRun.update({
      where: { id },
      data: { status: OpenRunStatus.CANCELLED },
      include: OPEN_RUN_INCLUDE,
    });
  }

  async findOne(id: string, userId?: string) {
    const run = await this.prisma.openRun.findUnique({
      where: { id },
      include: {
        court: { select: { id: true, name: true, address: true, city: true } },
        organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        participants: {
          where: {
            status: {
              in: [
                ParticipantStatus.PENDING,
                ParticipantStatus.APPROVED,
                ParticipantStatus.WAITLISTED,
              ],
            },
          },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!run) throw new NotFoundException('Игра не найдена');

    if (!run.isPublic && run.organizerId !== userId) {
      const isParticipant = run.participants.some(
        (p) => p.userId === userId && p.status === ParticipantStatus.APPROVED,
      );
      if (!isParticipant) throw new ForbiddenException('Это закрытая игра');
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
        skillLevel: dto.skillLevel ?? 'ANY',
        status: OpenRunStatus.OPEN,
      },
      include: OPEN_RUN_INCLUDE,
    });

    return this.formatRun(run);
  }

  /** Full edit — organizer of the run or moderator/admin. */
  async update(id: string, dto: UpdateOpenRunDto, actor: { id: string; role: UserRole }) {
    const run = await this.getRunOrFail(id);
    const isStaff = (ROLE_RANK[actor.role] ?? 0) >= ROLE_RANK[UserRole.MODERATOR];
    if (run.organizerId !== actor.id && !isStaff) throw new ForbiddenException();

    if (dto.courtId && dto.courtId !== run.courtId) {
      const court = await this.prisma.court.findUnique({ where: { id: dto.courtId } });
      if (!court) throw new NotFoundException('Корт не найден');
    }

    const data: Record<string, unknown> = { ...dto };
    if (dto.date) data.date = new Date(dto.date);
    if (dto.status) data.status = dto.status as OpenRunStatus;

    const updated = await this.prisma.openRun.update({
      where: { id },
      data,
      include: OPEN_RUN_INCLUDE,
    });
    return this.formatRun(updated);
  }

  /** Organizer (or staff) kicks a participant out entirely; waitlist auto-promotes. */
  async removeParticipant(
    runId: string,
    participantId: string,
    actor: { id: string; role: UserRole },
  ) {
    const run = await this.getRunOrFail(runId);
    const isStaff = (ROLE_RANK[actor.role] ?? 0) >= ROLE_RANK[UserRole.MODERATOR];
    if (run.organizerId !== actor.id && !isStaff) throw new ForbiddenException();

    const participant = await this.prisma.openRunParticipant.findUnique({
      where: { id: participantId },
    });
    if (!participant || participant.openRunId !== runId) {
      throw new NotFoundException('Участник не найден');
    }

    const freedSpot = participant.status === ParticipantStatus.APPROVED;

    await this.prisma.$transaction(async (tx) => {
      await tx.openRunParticipant.delete({ where: { id: participantId } });

      if (freedSpot) {
        const next = await tx.openRunParticipant.findFirst({
          where: { openRunId: runId, status: ParticipantStatus.WAITLISTED },
          orderBy: { createdAt: 'asc' },
        });
        if (next) {
          await tx.openRunParticipant.update({
            where: { id: next.id },
            data: { status: ParticipantStatus.APPROVED },
          });
        }
      }
    });

    await this.notifications.create(
      participant.userId,
      'PICKUP_GAME_UPDATE',
      `Организатор убрал тебя из игры "${run.title ?? 'Pickup Game'}"`,
      undefined,
      `/pickup-games/${runId}`,
    );
  }

  async cancel(id: string, userId: string) {
    const run = await this.getRunOrFail(id);
    if (run.organizerId !== userId) throw new ForbiddenException();
    if (run.status === OpenRunStatus.CANCELLED) {
      throw new BadRequestException('Игра уже отменена');
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
      throw new BadRequestException('Регистрация уже закрыта или игра отменена');
    }

    return this.prisma.openRun.update({
      where: { id },
      data: { status: OpenRunStatus.CLOSED },
      include: OPEN_RUN_INCLUDE,
    });
  }

  /** Join. Public + space → APPROVED; public + full → WAITLISTED; private → PENDING. */
  async join(id: string, userId: string) {
    const run = await this.prisma.openRun.findUnique({
      where: { id },
      include: {
        _count: { select: { participants: { where: { status: ParticipantStatus.APPROVED } } } },
      },
    });

    if (!run) throw new NotFoundException('Игра не найдена');
    if (run.status !== OpenRunStatus.OPEN) {
      throw new BadRequestException('Регистрация закрыта');
    }
    if (run.organizerId === userId) {
      throw new BadRequestException('Организатор уже участвует в своей игре');
    }

    const isFull = run._count.participants >= run.maxParticipants;
    const targetStatus = !run.isPublic
      ? ParticipantStatus.PENDING
      : isFull
        ? ParticipantStatus.WAITLISTED
        : ParticipantStatus.APPROVED;

    const existing = await this.prisma.openRunParticipant.findUnique({
      where: { openRunId_userId: { openRunId: id, userId } },
    });

    if (existing) {
      if (
        existing.status === ParticipantStatus.CANCELLED ||
        existing.status === ParticipantStatus.REJECTED
      ) {
        return this.prisma.openRunParticipant.update({
          where: { id: existing.id },
          data: { status: targetStatus },
        });
      }
      throw new ConflictException('Вы уже записаны на эту игру');
    }

    return this.prisma.openRunParticipant.create({
      data: { openRunId: id, userId, status: targetStatus },
    });
  }

  /** Leave. If an approved player leaves a public run, promote the next waitlisted. */
  async leave(id: string, userId: string) {
    const participant = await this.prisma.openRunParticipant.findUnique({
      where: { openRunId_userId: { openRunId: id, userId } },
    });
    if (!participant) throw new NotFoundException('Вы не записаны на эту игру');

    const freedSpot = participant.status === ParticipantStatus.APPROVED;

    await this.prisma.$transaction(async (tx) => {
      await tx.openRunParticipant.update({
        where: { id: participant.id },
        data: { status: ParticipantStatus.CANCELLED },
      });

      if (freedSpot) {
        const next = await tx.openRunParticipant.findFirst({
          where: { openRunId: id, status: ParticipantStatus.WAITLISTED },
          orderBy: { createdAt: 'asc' },
        });
        if (next) {
          await tx.openRunParticipant.update({
            where: { id: next.id },
            data: { status: ParticipantStatus.APPROVED },
          });
        }
      }
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

    const participant = await this.prisma.openRunParticipant.update({
      where: { id: participantId },
      data: { status },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (status === ParticipantStatus.APPROVED || status === ParticipantStatus.REJECTED) {
      await this.notifications.create(
        participant.userId,
        'PICKUP_GAME_UPDATE',
        status === ParticipantStatus.APPROVED
          ? `Вас приняли в игру "${run.title ?? 'Pickup Game'}"`
          : `Заявку на игру "${run.title ?? 'Pickup Game'}" отклонили`,
        undefined,
        `/pickup-games/${run.id}`,
      );
    }

    return participant;
  }

  private async getRunOrFail(id: string) {
    const run = await this.prisma.openRun.findUnique({ where: { id } });
    if (!run) throw new NotFoundException('Игра не найдена');
    return run;
  }

  // Arrow keeps `this`-free binding safe for use as a .map() callback.
  private formatRun = (run: any) => {
    const parts: Array<{ status: ParticipantStatus }> = run.participants ?? [];
    const currentParticipants = parts.filter(
      (p) => p.status === ParticipantStatus.APPROVED,
    ).length;
    const waitlistCount = parts.filter(
      (p) => p.status === ParticipantStatus.WAITLISTED,
    ).length;
    const spotsLeft = Math.max(0, run.maxParticipants - currentParticipants);
    return { ...run, currentParticipants, waitlistCount, spotsLeft };
  };
}
