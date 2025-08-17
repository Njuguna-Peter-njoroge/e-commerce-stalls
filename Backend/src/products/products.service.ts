/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './Dtos/createproduct.dto';
import { ProductStatus } from '@prisma/client';
import { ApiResponse } from '../shared/apiResponse';
import { ProductResponseDto } from './Dtos/productResponseDto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import {UpdateProductDto} from "./Dtos/updateproduct.dto";
import {response} from "express";

@Injectable()
export class ProductsService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async uploadToCloudinary(
        file: Express.Multer.File,
    ): Promise<{ secure_url: string; public_id: string }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {folder: 'shoppie_products'},
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Error:', error);
                        reject(new Error('Failed to upload image to Cloudinary'));
                    } else {
                        const cloudinaryResult = result as {
                            secure_url: string;
                            public_id: string;
                        };
                        console.log('✅ Cloudinary Upload Success:', cloudinaryResult);
                        resolve(cloudinaryResult);
                    }
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async createProduct(
        data: CreateProductDto,
        createdById: string,
    ): Promise<ApiResponse<ProductResponseDto>> {
        const existingProduct = await this.prismaService.product.findFirst({
            where: {
                name: data.name,
                stallId: data.stallId,
            },
        });

        if (existingProduct) {
            throw new ConflictException('product already exists');
        }

        const product = await this.prismaService.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                quantity: data.quantity,
                isWholesale: data.isWholesale ?? false,
                status: ProductStatus.PENDING,
                stallId: data.stallId,
                farmerId: data.farmerId || null,
                createdById,
            },
        });

        return {
            success: true,
            message: 'Product created successfully',
            data: {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                quantity: product.quantity,
                isWholesale: product.isWholesale,
                status: product.status,
                stallId: product.stallId,
                farmerId: product.farmerId,
                createdById: product.createdById,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            },
        };
    }

    async findAll(): Promise<ApiResponse<ProductResponseDto[]>> {
        try {
            const products = await this.prismaService.product.findMany();

            return {
                success: true,
                message: 'Products fetched successfully',
                data: products.map((product) => ({
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    quantity: product.quantity,
                    isWholesale: product.isWholesale,
                    status: product.status,
                    stallId: product.stallId,
                    farmerId: product.farmerId,
                    createdById: product.createdById,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                })),
            };
        } catch (error) {
            throw new BadRequestException(
                error instanceof PrismaClientKnownRequestError
                    ? error.message
                    : 'Something went wrong',
            );
        }
    }

    async findOne(name: string): Promise<ApiResponse<ProductResponseDto>> {
        if (!name) {
            throw new BadRequestException('Product name is required');
        }
        const product = await this.prismaService.product.findFirst({
            where: {
                name: name
            }

        });
        if (!product) {
            throw new BadRequestException(`Product with name "${name}" not found`);
        }
        const response: ProductResponseDto = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            isWholesale: product.isWholesale,
            status: product.status,
            stallId: product.stallId,
            farmerId: product.farmerId,
            createdById: product.createdById,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        }
        return {
            success: true,
            message: 'Product fetched successfully',
            data: response
        }
    }

    async findByName(name: string): Promise<ApiResponse<ProductResponseDto>> {
        if (!name) {
            throw new BadRequestException('Product name is required');
        }
        const product = await this.prismaService.product.findFirst({
            where: {
                name: name,
            }
        });
        if (!product) {
            throw new BadRequestException(`Product with name "${name}" not found`);
        }

        const response: ProductResponseDto = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            isWholesale: product.isWholesale,
            status: product.status,
            stallId: product.stallId,
            farmerId: product.farmerId,
            createdById: product.createdById,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
        return {
            success: true,
            message: 'Product fetched successfully',
            data: response
        }

    }

    async update(id: string, data: UpdateProductDto, createdById: string): Promise<ApiResponse<ProductResponseDto>> {
        try {
            const product = await this.prismaService.product.update({
                where: {id},
                data: {
                    ...data,
                    price: data.price,
                }
            });
            const response: ProductResponseDto = {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                quantity: product.quantity,
                isWholesale: product.isWholesale,
                status: product.status,
                stallId: product.stallId,
                farmerId: product.farmerId,
                createdById: product.createdById,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            };
            return {
                success: true,
                message: 'Product updated successfully',
                data: response
            }
        } catch (error) {
            throw new BadRequestException(
                error instanceof PrismaClientKnownRequestError
                    ? error.message
                    : 'Something went wrong',
            );
        }
    }

    async delete(id: string, createdById: string): Promise<ApiResponse<ProductResponseDto>> {
        if (!id) {
            throw new BadRequestException('Product id is required');
        }
        const product = await this.prismaService.product.findUnique({
            where: {id},
        });
        if (!product) {
            throw new BadRequestException(`Product with id "${id}" not found`);
        }

        try {
            await this.prismaService.product.delete({
                where: {id},
            });
            return {
                success: true,
                message: 'Product deleted successfully',
                data: {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    quantity: product.quantity,
                    isWholesale: product.isWholesale,
                    status: product.status,
                    stallId: product.stallId,
                    farmerId: product.farmerId,
                    createdById: product.createdById,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                }

            };

        } catch (error) {
            throw new BadRequestException(
                error instanceof PrismaClientKnownRequestError
                    ? error.message
                    : 'Something went wrong',
            );

        }
    }
}