import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  IsInt,
  IsIn,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus, MatchStatus } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ enum: EventStatus })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsString()
  location: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rules?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  prizePool?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  schedule?: { time: string; title: string }[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  sponsors?: { name: string; logoUrl?: string; url?: string }[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  faq?: { question: string; answer: string }[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  maxParticipants?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  resultsSummary?: string;
}

export class UpdateEventDto extends CreateEventDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  declare title: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  declare startDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  declare location: string;
}

export class RegisterEventDto {
  @ApiPropertyOptional({ description: 'Рост, см' })
  @IsInt()
  @Min(100)
  @Max(250)
  @IsOptional()
  @Type(() => Number)
  height?: number;

  @ApiPropertyOptional({ description: 'Вес, кг' })
  @IsInt()
  @Min(30)
  @Max(200)
  @IsOptional()
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({ description: 'Возраст' })
  @IsInt()
  @Min(10)
  @Max(80)
  @IsOptional()
  @Type(() => Number)
  age?: number;

  @ApiPropertyOptional({ description: 'Ссылка на видео-хайлайт' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  highlightUrl?: string;

  @ApiPropertyOptional({ description: 'Instagram username' })
  @IsString()
  @MaxLength(60)
  @IsOptional()
  instagram?: string;
}

export class ReviewRegistrationDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string;
}

export class UpdateMatchDto {
  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  score1?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  score2?: number;

  @ApiPropertyOptional({ enum: MatchStatus })
  @IsEnum(MatchStatus)
  @IsOptional()
  status?: MatchStatus;

  @ApiPropertyOptional({ description: 'id победителя (обязателен при status=COMPLETED)' })
  @IsString()
  @IsOptional()
  winnerId?: string;
}
