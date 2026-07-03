import { IsString, IsOptional, IsEnum, IsIn, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GiveawayStatus } from '@prisma/client';

export class CreateGiveawayDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  prize: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Условия участия' })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  conditions?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({ description: 'Заглавное изображение страницы' })
  @IsString()
  @IsOptional()
  bannerUrl?: string;
}

export class EnterGiveawayDto {
  @ApiPropertyOptional({ description: 'Как выполнил условия (ссылка/ник)' })
  @IsString()
  @MaxLength(300)
  @IsOptional()
  comment?: string;
}

export class ReviewEntryDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string;
}

export class UpdateGiveawayDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @IsOptional()
  prize?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Условия участия' })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  conditions?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional({ description: 'Заглавное изображение страницы' })
  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @ApiPropertyOptional({ enum: GiveawayStatus })
  @IsEnum(GiveawayStatus)
  @IsOptional()
  status?: GiveawayStatus;
}
