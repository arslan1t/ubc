import { Body, Controller, Headers, HttpCode, HttpStatus, Post, UnauthorizedException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { TelegramBotService } from './telegram-bot.service';

@ApiExcludeController()
@Controller('telegram')
export class TelegramBotController {
  constructor(private telegramBot: TelegramBotService) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Headers('x-telegram-bot-api-secret-token') secret: string | undefined,
    @Body() update: any,
  ) {
    if (!this.telegramBot.verifyWebhookSecret(secret)) {
      throw new UnauthorizedException();
    }
    await this.telegramBot.handleUpdate(update);
    return { ok: true };
  }
}
