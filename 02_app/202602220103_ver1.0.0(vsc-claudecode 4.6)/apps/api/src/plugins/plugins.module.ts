import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PluginsService } from './plugins.service';
import {
  PluginsMarketplaceController,
  PluginsAdminController,
  CommunityPluginsController,
} from './plugins.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    PluginsMarketplaceController,
    PluginsAdminController,
    CommunityPluginsController,
  ],
  providers: [PluginsService],
  exports: [PluginsService],
})
export class PluginsModule {}
