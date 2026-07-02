import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(2)
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(2)
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, { message: 'Неверный формат номера телефона' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  telegramUsername?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(30)
  @IsOptional()
  instagramUsername?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(280)
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(80)
  @IsOptional()
  city?: string;
}

export class SetRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;
}

export class SetActiveDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}
