import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
} from "class-validator";
import { Transform } from "class-transformer";

export class UpdateProductDto {
    @IsNotEmpty()
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsNotEmpty()
    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsOptional()
    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    stallId?: string;

    @IsNotEmpty()
    @IsOptional()
    @IsUrl()
    @Transform(({ value }) => value?.trim())
    image: string;

    @IsOptional()
    @IsBoolean()
    isWholesale?: boolean;
}
