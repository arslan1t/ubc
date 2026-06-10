import {
  Controller,
  Get,
  Patch,
  Body,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Мой профиль' })
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Обновить профиль' })
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Get('me/open-runs')
  @ApiOperation({ summary: 'Мои Open Runs' })
  getMyOpenRuns(@CurrentUser('id') userId: string) {
    return this.usersService.getMyOpenRuns(userId);
  }

  @Get('me/participations')
  @ApiOperation({ summary: 'Мои участия' })
  getMyParticipations(@CurrentUser('id') userId: string) {
    return this.usersService.getMyParticipations(userId);
  }
}
