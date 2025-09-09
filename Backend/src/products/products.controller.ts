import {
    BadRequestException,
    Body,
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Param,
    UploadedFile,
    UseInterceptors,
    Req,
    UseGuards, Patch, Query
} from '@nestjs/common';
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./Dtos/createproduct.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadApiResponse } from "cloudinary";
import { JwtAuthGuard } from "../jwt/jwt gurad";
import {UpdateProductDto} from "./Dtos/updateproduct.dto";
import {AuthenticatedRequest} from "../shared/requestinterface";
import {ProductStatus} from "@prisma/client";

@Controller('products')
export class ProductsController {
    constructor(private readonly productService: ProductsService) {}

    // ✅ Get all products
    @Get('findALL')
    async findAll() {
        return this.productService.findAll();
    }

    // ✅ Get product by ID
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.productService.findById(id);
    }

    // ✅ Get product by name
    @Get('name/:name')
    async findByName(@Param('name') name: string) {
        return this.productService.findByName(name);
    }

    // ✅ Create a product (protected)
    @Post()
    @UseGuards(JwtAuthGuard)
    async createProduct(@Body() data: CreateProductDto, @Req() req: any) {
        return this.productService.createProduct(data, req.user.id);
    }

    // ✅ Upload product with image (protected)
    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadAndCreateProduct(
        @UploadedFile() file: Express.Multer.File,
        @Body() productData: CreateProductDto,
        @Req() req: any,
    ) {
        if (!file) throw new BadRequestException('No file uploaded');

        const result: Partial<UploadApiResponse> =
            await this.productService.uploadToCloudinary(file);

        if (!result.secure_url) {
            throw new Error('Image upload failed');
        }

        const dataWithImageUrl: CreateProductDto = {
            ...productData,
            images: [result.secure_url],
        };

        return this.productService.createProduct(dataWithImageUrl, req.user.id);
    }

    // ✅ Update product (protected)
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() data: UpdateProductDto,
        @Req() req: AuthenticatedRequest
    ) {
        return this.productService.update(id, data, req.user.id);
    }


    // ✅ Delete product (protected)
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string, @Req() req: any) {
        return this.productService.delete(id, req.user.id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: ProductStatus,
        @Req() req: AuthenticatedRequest
    ){
        return this.productService.updateStatus(id, status, req.user.id);
    }

    @Get('search')
    async searchProducts(
        @Query('q') q: string,
        @Query('category') category?: string,
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.productService.search(q, category, minPrice, maxPrice, page, limit);
    }

}
