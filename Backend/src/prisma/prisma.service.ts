import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg'; // Changed 'Pg' to 'pg' (case sensitive)

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private static isConnected = false;

  constructor() {
    // Ensure DATABASE_URL is available
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    // Pass the adapter to the PrismaClient constructor
    super({ adapter });
  }

  async onModuleInit() {
    try {
      if (!PrismaService.isConnected) {
        await this.$connect();
        PrismaService.isConnected = true;
        this.logger.log('Database connection established');
      }
    } catch (error) {
      this.logger.error('Failed to connect to database');
      this.logger.error(error);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      PrismaService.isConnected = false;
      this.logger.log('Database connection closed');
    } catch (error) {
      this.logger.error('Error during database disconnection', error);
    }
  }
}
