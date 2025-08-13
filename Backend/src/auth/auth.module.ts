import { Module } from '@nestjs/common';
import {JwtModule, JwtService} from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {PrismaModule} from "../prisma/prisma.module";
import {MailerModule} from "../shared/mailer/mailer module";
import {JwtAuthGuard} from "../jwt/jwt gurad";
import {CustomMailerService} from "../shared/mailer/mailer service";
import {CustomJwtService} from "../jwt/jwt service";
import {CustomJwtModule} from "../custom jwt/custon-jwt.module";
import {JWTStrategy} from "../strategy/strategy";
import {RolesGuard} from "../Guards/roleguard";


@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    PrismaModule,
    MailerModule,
    CustomJwtModule,
  ],
  controllers: [AuthController],
  providers: [JWTStrategy, JwtAuthGuard, RolesGuard, CustomMailerService,AuthService],
  exports: [JwtModule, JwtAuthGuard, RolesGuard,AuthService],

})
export class AuthModule {}
