import { Module } from '@nestjs/common';
import { StallService } from './stall.service';
import { StallController } from './stall.controller';
import {PrismaService} from "../prisma/prisma.service";

@Module({
  providers: [StallService, PrismaService],
  controllers: [StallController]
})
export class StallModule {}
