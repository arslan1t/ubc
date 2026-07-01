import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
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
    if (!token) {
      await this.sendMessage(
        chatId,
        'Привет! Чтобы войти на сайт UBC, открой эту ссылку с сайта ubc-web-azure.vercel.app.',
      );
      return;
    }

    const session = await this.prisma.telegramLoginSession.findUnique({ where: { token } });
    if (!session || session.expiresAt < new Date()) {
      await this.sendMessage(chatId, 'Ссылка для входа устарела. Вернись на сайт и попробуй снова.');
      return;
    }

    await this.prisma.telegramLoginSession.update({
      where: { id: session.id },
      data: { chatId },
    });

    await this.sendMessage(
      chatId,
      'Нажми кнопку ниже, чтобы поделиться контактом и войти на сайт UBC.',
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
      await this.sendMessage(chatId, 'Сессия входа устарела. Вернись на сайт и попробуй снова.');
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
      'Готово! Возвращайся на сайт — вход выполнится автоматически.',
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

  verifyWebhookSecret(headerSecret: string | undefined) {
    const expected = this.config.get<string>('TELEGRAM_WEBHOOK_SECRET');
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
          secret_token: this.config.get<string>('TELEGRAM_WEBHOOK_SECRET'),
          allowed_updates: ['message'],
        }),
      });
      const data = (await res.json()) as { ok: boolean; description?: string };
      if (!data.ok) {
        this.logger.error(`Telegram setWebhook failed: ${data.description}`);
      } else {
        this.logger.log('Telegram webhook registered');
      }
    } catch (err) {
      this.logger.error(`Telegram setWebhook error: ${err}`);
    }
  }
}
