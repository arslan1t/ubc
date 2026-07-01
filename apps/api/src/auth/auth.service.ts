import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProvider, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto, TelegramAuthDto } from './dto/auth.dto';
import { TelegramBotService, ConfirmedTelegramSession } from '../telegram-bot/telegram-bot.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private telegramBot: TelegramBotService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });
    if (exists) {
      throw new ConflictException('Пользователь с таким email или телефоном уже существует');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        provider: AuthProvider.LOCAL,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    return this.generateTokens(user);
  }

  async handleGoogleAuth(googleUser: {
    googleId: string;
    email: string | null;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    if (!user && googleUser.email) {
      user = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.googleId },
        });
      }
    }

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: googleUser.googleId,
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          avatarUrl: googleUser.avatarUrl,
          provider: AuthProvider.GOOGLE,
        },
      });
    }

    return this.generateTokens(user);
  }

  async handleTelegramAuth(dto: TelegramAuthDto) {
    this.verifyTelegramHash(dto);

    let user = await this.prisma.user.findUnique({
      where: { telegramId: String(dto.id) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: String(dto.id),
          telegramUsername: dto.username ?? null,
          firstName: dto.first_name ?? 'Пользователь',
          lastName: dto.last_name ?? '',
          avatarUrl: dto.photo_url ?? null,
          provider: AuthProvider.TELEGRAM,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { telegramUsername: dto.username ?? user.telegramUsername },
      });
    }

    return this.generateTokens(user);
  }

  startTelegramBotLogin() {
    return this.telegramBot.createLoginSession();
  }

  async getTelegramBotLoginStatus(token: string) {
    const session = await this.telegramBot.consumeConfirmedSession(token);
    if (session === 'pending' || session === 'expired') {
      return { status: session };
    }

    const user = await this.upsertUserFromTelegramBotSession(session);
    const tokens = await this.generateTokens(user);
    return { status: 'confirmed' as const, ...tokens };
  }

  private async upsertUserFromTelegramBotSession(
    session: ConfirmedTelegramSession,
  ): Promise<User> {
    let user = await this.prisma.user.findUnique({ where: { telegramId: session.telegramId } });

    if (!user) {
      user = await this.createTelegramUser(session);
    } else if (session.phone && user.phone !== session.phone) {
      user = await this.prisma.user
        .update({ where: { id: user.id }, data: { phone: session.phone } })
        .catch(() => user!);
    }

    return user;
  }

  private async createTelegramUser(session: ConfirmedTelegramSession) {
    const data = {
      telegramId: session.telegramId,
      telegramUsername: session.username ?? null,
      firstName: session.firstName ?? 'Пользователь',
      lastName: session.lastName ?? '',
      avatarUrl: session.photoUrl ?? null,
      phone: session.phone ?? undefined,
      provider: AuthProvider.TELEGRAM,
    };

    try {
      return await this.prisma.user.create({ data });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        // phone already belongs to another account — create without it
        return this.prisma.user.create({ data: { ...data, phone: undefined } });
      }
      throw err;
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }

  private async generateTokens(user: { id: string; email?: string | null; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      }),
    ]);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  private verifyTelegramHash(dto: TelegramAuthDto) {
    const botToken = this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    const { hash, ...rest } = dto;
    const dataCheckString = Object.entries(rest)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const now = Math.floor(Date.now() / 1000);
    if (now - dto.auth_date > 86400) {
      throw new BadRequestException('Telegram auth data expired');
    }

    if (computedHash !== hash) {
      throw new UnauthorizedException('Invalid Telegram hash');
    }
  }
}
