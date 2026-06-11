import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionType } from '@prisma/client';

export class CreateSubmissionDto {
  @ApiProperty({ enum: SubmissionType })
  @IsEnum(SubmissionType)
  type!: SubmissionType;

  @ApiProperty({ description: 'Proposed entity payload (type-specific fields)' })
  @IsObject()
  payload!: Record<string, any>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  targetType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  targetId?: string;
}

export class ReviewSubmissionDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string;
}
