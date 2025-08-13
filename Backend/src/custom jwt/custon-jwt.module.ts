import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {CustomJwtService} from "../jwt/jwt service";

@Module({
    imports: [ConfigModule],
    providers: [CustomJwtService],
    exports: [CustomJwtService],
})
export class CustomJwtModule {}
