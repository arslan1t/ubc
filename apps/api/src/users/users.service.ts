import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ROLE_RANK } from '../common/guards/roles.guard';

const USER_ADMIN_SELECT = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  role: true,
  reputation: true,
  isActive: true,
  createdAt: true,
};

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  bio: true,
  city: true,
  reputation: true,
  phone: true,
  telegramUsername: true,
  instagramUsername: true,
  avatarUrl: true,
  role: true,
  provider: true,
  createdAt: true,
};

// What strangers see on /players/[id] — no phone, no email, no role.
const USER_PUBLIC_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  bio: true,
  city: true,
  reputation: true,
  telegramUsername: true,
  instagramUsername: true,
  createdAt: true,
};

/** Accepts "@user", "user", "instagram.com/user", full https URLs — stores the bare username. */
function normalizeInstagram(raw: string): string | null {
  let v = raw.trim();
  if (!v) return null;
  v = v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@+/, '');
  v = v.split(/[/?#]/)[0].trim();
  return v || null;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    if (dto.phone) {
      const existing = await this.prisma.user.findFirst({
        where: { phone: dto.phone, NOT: { id: userId } },
      });
      if (existing) throw new ConflictException('Этот номер телефона уже используется');
    }

    const data: Record<string, unknown> = { ...dto };
    if (dto.instagramUsername !== undefined && dto.instagramUsername !== null) {
      data.instagramUsername = normalizeInstagram(dto.instagramUsername);
    }
    // Blank text fields mean "clear it", not "store an empty string".
    for (const key of ['telegramUsername', 'bio', 'city'] as const) {
      if (typeof data[key] === 'string' && !(data[key] as string).trim()) data[key] = null;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: USER_SELECT,
    });
  }

  /** Public player page — safe fields + activity stats + upcoming games they organize. */
  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...USER_PUBLIC_SELECT,
        isActive: true,
        _count: {
          select: {
            organizedRuns: true,
            participations: { where: { status: 'APPROVED' } },
            reviews: true,
          },
        },
      },
    });
    if (!user || !user.isActive) throw new NotFoundException('Игрок не найден');

    const upcomingRuns = await this.prisma.openRun.findMany({
      where: { organizerId: userId, status: 'OPEN', isPublic: true, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        date: true,
        startTime: true,
        court: { select: { name: true, city: true } },
      },
    });

    const { isActive: _isActive, _count, ...publicFields } = user;
    return {
      ...publicFields,
      stats: {
        gamesOrganized: _count.organizedRuns,
        gamesJoined: _count.participations,
        reviews: _count.reviews,
      },
      upcomingRuns,
    };
  }

  async uploadAvatar(userId: string, buffer: Buffer, mimeType?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarKey: true },
    });

    if (user?.avatarKey) {
      await this.storage.deleteFile(user.avatarKey);
    }

    const { key, url } = await this.storage.uploadAvatar(buffer, mimeType);
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: url, avatarKey: key },
      select: USER_SELECT,
    });
  }

  async getMyOpenRuns(userId: string) {
    return this.prisma.openRun.findMany({
      where: { organizerId: userId },
      include: {
        court: { select: { id: true, name: true, address: true, city: true } },
        _count: { select: { participants: { where: { status: 'APPROVED' } } } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getMyParticipations(userId: string) {
    return this.prisma.openRunParticipant.findMany({
      where: { userId },
      include: {
        openRun: {
          include: {
            court: { select: { id: true, name: true, address: true, city: true } },
            organizer: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { openRun: { date: 'desc' } },
    });
  }

  // ─── Admin: user management ───

  async listUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, params.limit ?? 30);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.role) where.role = params.role;
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ role: 'desc' }, { createdAt: 'desc' }],
        select: {
          ...USER_ADMIN_SELECT,
          _count: {
            select: { organizedRuns: true, reviews: true, submissions: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Change a user's role with hierarchy safeguards. */
  async setRole(
    actor: { id: string; role: UserRole },
    targetId: string,
    newRole: UserRole,
  ) {
    if (actor.id === targetId) {
      throw new ForbiddenException('Нельзя изменить собственную роль');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException('Пользователь не найден');

    const actorRank = ROLE_RANK[actor.role] ?? 0;

    // You cannot assign a role at or above your own rank.
    if ((ROLE_RANK[newRole] ?? 99) >= actorRank) {
      throw new ForbiddenException('Нельзя назначить роль выше или равную собственной');
    }
    // Only someone strictly above can change a user who already holds an elevated role.
    if ((ROLE_RANK[target.role] ?? 0) >= actorRank) {
      throw new ForbiddenException('Недостаточно прав для изменения роли этого пользователя');
    }

    return this.prisma.user.update({
      where: { id: targetId },
      data: { role: newRole },
      select: USER_ADMIN_SELECT,
    });
  }

  /** Activate/deactivate a user — deactivated users are blocked at every login path. */
  async setActive(
    actor: { id: string; role: UserRole },
    targetId: string,
    isActive: boolean,
  ) {
    if (actor.id === targetId) {
      throw new ForbiddenException('Нельзя заблокировать самого себя');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException('Пользователь не найден');

    const actorRank = ROLE_RANK[actor.role] ?? 0;
    if ((ROLE_RANK[target.role] ?? 0) >= actorRank) {
      throw new ForbiddenException('Недостаточно прав для изменения этого пользователя');
    }

    return this.prisma.user.update({
      where: { id: targetId },
      data: { isActive, ...(isActive ? {} : { refreshToken: null }) },
      select: USER_ADMIN_SELECT,
    });
  }
}
