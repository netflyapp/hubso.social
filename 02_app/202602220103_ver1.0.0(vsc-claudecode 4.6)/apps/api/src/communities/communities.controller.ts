import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';

@ApiTags('communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private communitiesService: CommunitiesService) {}

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.communitiesService.findBySlug(slug);
  }
}
