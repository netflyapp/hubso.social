import { Module } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [CommunitiesService, OptionalJwtAuthGuard],
  controllers: [CommunitiesController],
})
export class CommunitiesModule {}
