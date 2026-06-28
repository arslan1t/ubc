import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { BroadcastNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Internal helper — other services call this to notify a single user.
  async create(userId: string, type: NotificationType, title: string, body?: string, link?: string) {
    return this.prisma.notification.create({
      data: { userId, type, title, body, link },
    });
  }

  async listMine(userId: string, page = 1, limit = 20) {
    const skip = (Math.max(1, page) - 1) * limit;
    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { data, total, unreadCount, page, limit };
  }

  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async broadcast(dto: BroadcastNotificationDto) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    const type = dto.type ?? NotificationType.ANNOUNCEMENT;
    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type,
        title: dto.title,
        body: dto.body,
        link: dto.link,
      })),
    });
    return { sentTo: users.length };
  }

  async adminListAll(page = 1, limit = 30) {
    const skip = (Math.max(1, page) - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.notification.count(),
    ]);
    return { data, total, page, limit };
  }
}
