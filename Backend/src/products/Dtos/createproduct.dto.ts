import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl, IsUUID,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    stallId?: string;

    @IsOptional()
    @IsUUID()
    farmerId?: string;


    @IsNotEmpty()
    @IsUrl({}, {each: true})
    @Transform(({ value }) => value?.trim())
    images?: string[];

    @IsOptional()
    @IsBoolean()
    isWholesale?: boolean;
}
