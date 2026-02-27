import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from './search.service';
import { MeilisearchService } from './meilisearch.service';
import { PoliciesGuard, CheckPolicies } from '../casl';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly meili: MeilisearchService,
  ) {}

  /**
   * GET /search?q=foo&type=all&limit=10
   * Public endpoint — no auth required.
   */
  @Get()
  search(
    @Query('q') q = '',
    @Query('type') type: 'all' | 'users' | 'communities' | 'posts' = 'all',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.searchService.search(q, type, Math.min(limit, 50));
  }

  /**
   * GET /search/suggestions?q=foo
   * Requires auth — powers Cmd+K command palette.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('suggestions')
  suggestions(@Query('q') q = '', @Request() req: { user: { id: string } }) {
    return this.searchService.suggestions(q, req.user.id);
  }

  /**
   * GET /search/members/:communityId?q=&role=&page=&limit=
   * Member directory search — requires auth.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('members/:communityId')
  searchMembers(
    @Param('communityId') communityId: string,
    @Query('q') q = '',
    @Query('role') role?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.searchService.searchMembers(
      communityId,
      q,
      role,
      page,
      Math.min(limit, 50),
    );
  }

  /**
   * GET /search/health
   * Check Meilisearch availability.
   */
  @Get('health')
  async health() {
    const available = this.meili.isAvailable;
    const healthy = available ? await this.meili.isHealthy() : false;
    return { meilisearch: { available, healthy } };
  }

  /**
   * POST /search/reindex
   * Admin-only: trigger full reindex of all content.
   */
  @UseGuards(AuthGuard('jwt'), PoliciesGuard)
  @CheckPolicies('manage', 'User')
  @Post('reindex')
  async reindex() {
    return this.searchService.reindexAll();
  }
}
