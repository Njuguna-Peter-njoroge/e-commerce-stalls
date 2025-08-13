import {IsEmail, IsNotEmpty, IsString, MinLength} from "class-validator";

export class ResetPasswordDto {
    @IsEmail()
    email: string;

    @IsNotEmpty({message: 'Token is required'})
    @IsString()
    @MinLength(6)
    token: string;

    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @IsNotEmpty()
    @IsString()
    newPassword: string;
}