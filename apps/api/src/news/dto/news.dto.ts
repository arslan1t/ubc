import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NewsCategory } from '@prisma/client';

export class CreateNewsDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  content: string;

  @ApiProperty({ enum: NewsCategory })
  @IsEnum(NewsCategory)
  category: NewsCategory;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublished?: boolean;
}

export class UpdateNewsDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(5)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ enum: NewsCategory })
  @IsEnum(NewsCategory)
  @IsOptional()
  category?: NewsCategory;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPublished?: boolean;
}

export class NewsFiltersDto {
  @ApiPropertyOptional({ enum: NewsCategory })
  @IsEnum(NewsCategory)
  @IsOptional()
  category?: NewsCategory;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
