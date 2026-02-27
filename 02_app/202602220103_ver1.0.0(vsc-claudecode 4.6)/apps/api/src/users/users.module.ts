import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { StorageModule } from '../storage/storage.module';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@Module({
  imports: [StorageModule],
  providers: [UsersService, OptionalJwtAuthGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
