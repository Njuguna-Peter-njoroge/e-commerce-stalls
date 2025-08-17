import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateStallDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    name?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    location?: string;

    @IsOptional()
    @IsUUID()
    ownerId?: string;
}
