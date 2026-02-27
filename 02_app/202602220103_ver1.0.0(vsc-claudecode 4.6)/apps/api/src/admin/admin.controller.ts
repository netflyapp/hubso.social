import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { PoliciesGuard, CheckPolicies } from '../casl';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // GET /admin/stats
  @Get('stats')
  @CheckPolicies('manage', 'User')
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  // GET /admin/users
  @Get('users')
  @CheckPolicies('manage', 'User')
  async listUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.listUsers({
      page,
      limit: Math.min(limit, 100),
      search,
      role,
      status,
    });
  }

  // PATCH /admin/users/:id
  @Patch('users/:id')
  @CheckPolicies('manage', 'User')
  async updateUser(
    @Request() req: { user: { userId: string; role: string } },
    @Param('id') targetId: string,
    @Body() body: { role?: string; status?: string },
  ) {
    return this.adminService.updateUser(req.user.userId, targetId, body);
  }

  // DELETE /admin/users/:id
  @Delete('users/:id')
  @HttpCode(200)
  @CheckPolicies('manage', 'User')
  async deleteUser(
    @Request() req: { user: { userId: string; role: string } },
    @Param('id') targetId: string,
  ) {
    return this.adminService.deleteUser(req.user.userId, targetId);
  }

  // GET /admin/moderation
  @Get('moderation')
  @CheckPolicies('moderate', 'Post')
  async getModerationQueue(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getModerationQueue({ page, limit });
  }

  // POST /admin/moderation/:postId/flag
  @Post('moderation/:postId/flag')
  @HttpCode(200)
  @CheckPolicies('moderate', 'Post')
  async flagPost(
    @Param('postId') postId: string,
  ) {
    return this.adminService.flagPost(postId, true);
  }

  // POST /admin/moderation/:postId/approve
  @Post('moderation/:postId/approve')
  @HttpCode(200)
  @CheckPolicies('moderate', 'Post')
  async approvePost(
    @Param('postId') postId: string,
  ) {
    return this.adminService.approvePost(postId);
  }

  // POST /admin/moderation/:postId/reject
  @Post('moderation/:postId/reject')
  @HttpCode(200)
  @CheckPolicies('moderate', 'Post')
  async rejectPost(
    @Param('postId') postId: string,
  ) {
    return this.adminService.rejectPost(postId);
  }

  // POST /admin/moderation/:postId/unflag
  @Post('moderation/:postId/unflag')
  @HttpCode(200)
  @CheckPolicies('moderate', 'Post')
  async unflagPost(
    @Param('postId') postId: string,
  ) {
    return this.adminService.flagPost(postId, false);
  }

  // PATCH /admin/communities/:slug/branding
  @Patch('communities/:slug/branding')
  @CheckPolicies('manage', 'Community')
  async updateBranding(
    @Request() req: { user: { userId: string; role: string } },
    @Param('slug') slug: string,
    @Body()
    body: {
      brandColor?: string;
      brandFont?: string;
      logoUrl?: string;
      coverUrl?: string;
      description?: string;
    },
  ) {
    return this.adminService.updateCommunityBranding(
      slug,
      req.user.userId,
      body,
    );
  }
}
