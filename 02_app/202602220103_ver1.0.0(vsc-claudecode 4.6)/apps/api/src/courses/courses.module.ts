import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController, EnrollmentsController } from './courses.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CoursesService],
  controllers: [CoursesController, EnrollmentsController],
  exports: [CoursesService],
})
export class CoursesModule {}
