import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class FilterProductDto {
    @IsOptional()
    @IsString()
    name?: string; // Search by product name

    @IsOptional()
    @IsUUID()
    stallId?: string; // Filter by stall

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus; // Filter by product status

    @IsOptional()
    @IsNumber()
    @Min(0)
    minPrice?: number; // Minimum price filter

    @IsOptional()
    @IsNumber()
    @Min(0)
    maxPrice?: number; // Maximum price filter
}
