import { Module } from '@nestjs/common';
import { StallService } from './stall.service';
import { StallController } from './stall.controller';

@Module({
  providers: [StallService],
  controllers: [StallController]
})
export class StallModule {}
