import {IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {Transform} from "class-transformer";


export enum Role {
    MAIN_ADMIN= "MAIN-ADMIN",
    STALL_ADMIN="STALL-ADMIN",
    CUSTOMER="CUSTOMER",
    COURIER = "COURIER",
    FARMER = "FARMER",
    RETAILER ="RETAILER"
}
export class UpdateUserDto{
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @Transform(({ value }) => value?.trim())
    email: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    password: string;

    @IsNotEmpty()
    @IsEnum(Role)
    @IsString()
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    ROLE: Role;

}