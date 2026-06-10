import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsUUID,
  IsDateString,
  Matches,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpenRunDto {
  @ApiProperty()
  @IsUUID()
  courtId: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(2)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2025-08-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Неверный формат времени (HH:MM)' })
  startTime: string;

  @ApiProperty({ example: '20:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Неверный формат времени (HH:MM)' })
  endTime: string;

  @ApiProperty({ minimum: 2, maximum: 50 })
  @IsNumber()
  @Min(2)
  @Max(50)
  @Type(() => Number)
  maxParticipants: number;

  @ApiPropertyOptional({ default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  fee?: number;

  @ApiProperty()
  @IsBoolean()
  @Type(() => Boolean)
  isPublic: boolean;
}

export class OpenRunFiltersDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  courtId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  upcoming?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
