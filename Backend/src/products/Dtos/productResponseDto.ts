import { ProductStatus } from '@prisma/client';
import { ProductImageDto } from './productimage.dto';

export class ProductResponseDto {
  id?: string;
  name?: string;
  description?: string | null;
  price?: number;
  quantity?: number;
  isWholesale?: boolean;
  status?: ProductStatus;
  farmerId?: string | null;
  stallId?: string | null;
  createdById: string | null;
  images?: ProductImageDto[];
  createdAt?: Date;
  updatedAt?: Date;
}
