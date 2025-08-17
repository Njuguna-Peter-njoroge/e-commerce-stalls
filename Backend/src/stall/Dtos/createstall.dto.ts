import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateStallDto {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    location?: string;

    @IsNotEmpty()
    @IsUUID()
    ownerId: string;
}
