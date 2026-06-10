import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  telegramUsername: true,
  avatarUrl: true,
  role: true,
  provider: true,
  createdAt: true,
};

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

    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: USER_SELECT,
    });
  }

  async uploadAvatar(userId: string, buffer: Buffer) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarKey: true },
    });

    if (user?.avatarKey) {
      await this.storage.deleteFile(user.avatarKey);
    }

    const { key, url } = await this.storage.uploadAvatar(buffer);
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
}
