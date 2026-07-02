import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, TelegramAuthDto } from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Регистрация' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновить токен' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Public()
  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход через Telegram' })
  telegramAuth(@Body() dto: TelegramAuthDto) {
    return this.authService.handleTelegramAuth(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('telegram-bot/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Начать вход через Telegram-бота (шеринг контакта)' })
  startTelegramBotLogin() {
    return this.authService.startTelegramBotLogin();
  }

  @Public()
  @Get('telegram-bot/status/:token')
  @ApiOperation({ summary: 'Статус сессии входа через Telegram-бота' })
  getTelegramBotLoginStatus(@Param('token') token: string) {
    return this.authService.getTelegramBotLoginStatus(token);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: FastifyRequest & { user: any }, @Res() res: FastifyReply) {
    const tokens = await this.authService.handleGoogleAuth(req.user);
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const params = new URLSearchParams(tokens);
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
}
