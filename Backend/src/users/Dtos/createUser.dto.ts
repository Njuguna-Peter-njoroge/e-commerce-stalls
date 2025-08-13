import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role; // Now it will only accept Role.MAIN_ADMIN, Role.CUSTOMER, etc.
}
