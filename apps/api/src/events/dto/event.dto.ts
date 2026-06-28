import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';

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
