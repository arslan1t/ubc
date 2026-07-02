import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const SESSION_TTL_MS = 5 * 60 * 1000;

export interface ConfirmedTelegramSession {
  telegramId: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
}

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      await this.registerWebhook();
    }
  }

  private get botToken() {
    return this.config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
  }

  private get botUsername() {
    return this.config.get<string>('TELEGRAM_BOT_USERNAME', 'ubculturebot');
  }

  private apiUrl(method: string) {
    return `https://api.telegram.org/bot${this.botToken}/${method}`;
  }

  async createLoginSession() {
    await this.prisma.telegramLoginSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const token = randomUUID();
    await this.prisma.telegramLoginSession.create({
      data: { token, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
    });

    return {
      token,
      deepLink: `https://t.me/${this.botUsername}?start=${token}`,
      expiresIn: SESSION_TTL_MS / 1000,
    };
  }

  /** Returns 'pending' | 'expired', or the confirmed session (consuming it so it can't be replayed). */
  async consumeConfirmedSession(
    token: string,
  ): Promise<'pending' | 'expired' | ConfirmedTelegramSession> {
    const session = await this.prisma.telegramLoginSession.findUnique({ where: { token } });

    if (!session || session.expiresAt < new Date()) {
      return 'expired';
    }
    if (session.status !== 'CONFIRMED') {
      return 'pending';
    }

    await this.prisma.telegramLoginSession.delete({ where: { id: session.id } });

    return {
      telegramId: session.telegramId!,
      phone: session.phone,
      firstName: session.firstName,
      lastName: session.lastName,
      username: session.username,
      photoUrl: session.photoUrl,
    };
  }

  async handleUpdate(update: any) {
    const message = update?.message;
    if (!message) return;

    const chatId = message.chat?.id != null ? String(message.chat.id) : null;
    if (!chatId) return;

    if (typeof message.text === 'string' && message.text.startsWith('/start')) {
      const [, payload] = message.text.trim().split(/\s+/);
      await this.handleStart(chatId, payload);
      return;
    }

    if (message.contact) {
      await this.handleContact(chatId, message.contact);
    }
  }

  private async handleStart(chatId: string, token?: string) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'https://ubc-web-azure.vercel.app');

    if (!token) {
      await this.sendMessage(
        chatId,
        `Привет! 🏀 Это бот входа на сайт UBC — Uzbek Basketball Culture.\n\nЧтобы войти:\n1. Открой ${frontendUrl}/auth/login\n2. Нажми «Войти через Telegram»\n3. Вернись сюда и нажми кнопку «Поделиться контактом»`,
      );
      return;
    }

    const session = await this.prisma.telegramLoginSession.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      await this.sendMessage(
        chatId,
        `⏰ Ссылка для входа устарела (она действует 5 минут).\n\nВернись на ${frontendUrl}/auth/login и нажми «Войти через Telegram» ещё раз.`,
      );
      return;
    }

    await this.prisma.telegramLoginSession.update({
      where: { id: session.id },
      data: { chatId },
    });

    await this.sendMessage(
      chatId,
      'Остался один шаг! 👇\n\nНажми кнопку «📱 Поделиться контактом» внизу экрана — и вход на сайт выполнится автоматически.\n\nМы получим только твоё имя и номер телефона. Никаких сообщений и рассылок.',
      {
        keyboard: [[{ text: '📱 Поделиться контактом', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    );
  }

  private async handleContact(
    chatId: string,
    contact: { phone_number?: string; first_name?: string; last_name?: string; user_id?: number },
  ) {
    const session = await this.prisma.telegramLoginSession.findFirst({
      where: { chatId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    if (!session || session.expiresAt < new Date()) {
      const frontendUrl = this.config.get<string>('FRONTEND_URL', 'https://ubc-web-azure.vercel.app');
      await this.sendMessage(
        chatId,
        `⏰ Сессия входа устарела.\n\nВернись на ${frontendUrl}/auth/login и нажми «Войти через Telegram» ещё раз.`,
        { remove_keyboard: true },
      );
      return;
    }

    const phone = contact.phone_number
      ? contact.phone_number.startsWith('+')
        ? contact.phone_number
        : `+${contact.phone_number}`
      : null;

    await this.prisma.telegramLoginSession.update({
      where: { id: session.id },
      data: {
        status: 'CONFIRMED',
        telegramId: contact.user_id ? String(contact.user_id) : chatId,
        phone,
        firstName: contact.first_name ?? null,
        lastName: contact.last_name ?? null,
      },
    });

    await this.sendMessage(
      chatId,
      '✅ Готово! Вход выполнен.\n\nВозвращайся на вкладку сайта — через пару секунд ты будешь в своём аккаунте.',
      { remove_keyboard: true },
    );
  }

  private async sendMessage(chatId: string, text: string, reply_markup?: unknown) {
    try {
      await fetch(this.apiUrl('sendMessage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, reply_markup }),
      });
    } catch (err) {
      this.logger.error(`Failed to send Telegram message: ${err}`);
    }
  }

  /**
   * Telegram only accepts secret tokens of [A-Za-z0-9_-]{1,256}. Deriving a
   * sha256 hex from the env value guarantees a valid token no matter what
   * characters the platform's secret generator produced.
   */
  private get webhookSecret(): string | undefined {
    const raw = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET');
    if (!raw) return undefined;
    return createHash('sha256').update(raw).digest('hex');
  }

  verifyWebhookSecret(headerSecret: string | undefined) {
    const expected = this.webhookSecret;
    if (!expected) return true;
    return headerSecret === expected;
  }

  private async registerWebhook() {
    const publicUrl = this.config.get<string>('API_PUBLIC_URL');
    if (!publicUrl || !publicUrl.startsWith('https://')) {
      this.logger.warn('Skipping Telegram webhook registration — API_PUBLIC_URL is not an https URL');
      return;
    }

    try {
      const res = await fetch(this.apiUrl('setWebhook'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: `${publicUrl}/api/v1/telegram/webhook`,
          secret_token: this.webhookSecret,
          allowed_updates: ['message'],
        }),
      });
      const data = (await res.json()) as { ok: boolean; description?: string };
      if (!data.ok) {
        this.logger.error(`Telegram setWebhook failed: ${data.description}`);
      } else {
        this.logger.log(`Telegram webhook registered: ${publicUrl}/api/v1/telegram/webhook`);
      }
    } catch (err) {
      this.logger.error(`Telegram setWebhook error: ${err}`);
    }
  }
}
