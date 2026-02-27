import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GamificationService } from './gamification.service';
import {
  GamificationController,
  GamificationAdminController,
} from './gamification.controller';

@Module({
  imports: [PrismaModule],
  providers: [GamificationService],
  controllers: [GamificationController, GamificationAdminController],
  exports: [GamificationService],
})
export class GamificationModule {}
