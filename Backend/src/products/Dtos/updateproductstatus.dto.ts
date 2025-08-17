import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class UpdateProductStatusDto {
    @IsEnum(ProductStatus, {
        message: 'Status must be one of: PENDING, APPROVED, REJECTED',
    })
    @IsNotEmpty()
    status: ProductStatus;
}
