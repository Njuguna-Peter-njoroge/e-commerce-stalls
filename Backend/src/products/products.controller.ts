import {
    BadRequestException,
    Body,
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Req,
    UseGuards
} from '@nestjs/common';
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./Dtos/createproduct.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadApiResponse } from "cloudinary";
import {JwtAuthGuard} from "../jwt/jwt gurad";

@Controller('products')
export class ProductsController {
    constructor(private readonly productService: ProductsService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('image'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const result = await this.productService.uploadToCloudinary(file);
            return {
                success: true,
                message: 'Image uploaded successfully',
                imageUrl: result.secure_url,
            };
        } catch (error) {
            const message =
                error instanceof Error ? error.message : JSON.stringify(error);
            throw new BadRequestException('Failed to upload image: ' + message);
        }
    }

    @Post('upload-and-create')
    @UseGuards(JwtAuthGuard) // protect route
    @UseInterceptors(FileInterceptor('file'))
    async uploadAndCreateProduct(
        @UploadedFile() file: Express.Multer.File,
        @Body() productData: CreateProductDto,
        @Req() req: any,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        try {
            const result: Partial<UploadApiResponse> =
                await this.productService.uploadToCloudinary(file);

            if (!result.secure_url) {
                throw new Error('Image upload did not return a secure_url');
            }

            const dataWithImageUrl: CreateProductDto = {
                ...productData,
                images: [result.secure_url],
            };

            // ✅ Use logged in user's ID
            const createdById = req.user.id;

            return await this.productService.createProduct(dataWithImageUrl, createdById);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : JSON.stringify(error);
            throw new BadRequestException('Failed to create product: ' + message);
        }
    }

    @Post('create-product')
    @UseGuards(JwtAuthGuard)
    async createProduct(@Body() data: CreateProductDto, @Req() req: any) {
        const createdById = req.user.id;
        return this.productService.createProduct(data, createdById);
    }

    @Post('find-all')
    async findAll() {
        return this.productService.findAll();
    }

    @Post('find-by-name')
    async findByName(@Body('name') name: string) {
        return this.productService.findByName(name);
    }
    @Post('find-by-id')
    async findById(@Body('id') id: string) {
        return this.productService.findOne(id);
    }
    @Post('update')
    @UseGuards(JwtAuthGuard)
    async update(@Body() data: any, @Req() req: any) {
        const createdById = req.user.id;
        return this.productService.update(data.id, data, createdById);
    }

    @Post('delete')
    @UseGuards(JwtAuthGuard)
    async delete(@Body() data: any, @Req() req: any) {
        const createdById = req.user.id;
    }
    @Post('delete-by-id')
    @UseGuards(JwtAuthGuard)
    async deleteById(@Body('id') id: string, @Req() req: any) {}
}
