import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SpacesService } from './spaces.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@ApiTags('spaces')
@Controller()
export class SpacesController {
  constructor(private spacesService: SpacesService) {}

  // ── Space Groups ────────────────────────────────────

  @Get('communities/:slug/space-groups')
  @UseGuards(OptionalJwtAuthGuard)
  async getGroups(@Param('slug') slug: string) {
    return this.spacesService.findGroups(slug);
  }

  @Post('communities/:slug/space-groups')
  @HttpCode(201)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async createGroup(
    @Param('slug') slug: string,
    @Body() body: { name: string; position?: number; collapsedDefault?: boolean },
    @Request() req: { user: { userId: string } },
  ) {
    return this.spacesService.createGroup(slug, req.user.userId, body);
  }

  @Patch('space-groups/:groupId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async updateGroup(
    @Param('groupId') groupId: string,
    @Body() body: { name?: string; position?: number; collapsedDefault?: boolean },
    @Request() req: { user: { userId: string } },
  ) {
    return this.spacesService.updateGroup(groupId, req.user.userId, body);
  }

  @Delete('space-groups/:groupId')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async deleteGroup(
    @Param('groupId') groupId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.spacesService.deleteGroup(groupId, req.user.userId);
  }

  // ── Spaces ──────────────────────────────────────────

  @Get('communities/:slug/spaces')
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Param('slug') slug: string,
    @Request() req: { user?: { userId: string } },
  ) {
    return this.spacesService.findAll(slug, req.user?.userId);
  }

  @Post('communities/:slug/spaces')
  @HttpCode(201)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(
    @Param('slug') slug: string,
    @Body()
    body: {
      name: string;
      description?: string;
      type: 'POSTS' | 'CHAT' | 'EVENTS' | 'LINKS' | 'FILES';
      visibility?: 'PUBLIC' | 'PRIVATE' | 'SECRET';
      spaceGroupId?: string;
    },
    @Request() req: { user: { userId: string } },
  ) {
    return this.spacesService.create(slug, req.user.userId, body);
  }

  @Get('spaces/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Request() req: { user?: { userId: string } },
  ) {
    return this.spacesService.findById(id, req.user?.userId);
  }

  @Patch('spaces/:id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      visibility?: 'PUBLIC' | 'PRIVATE' | 'SECRET';
      spaceGroupId?: string | null;
      paywallEnabled?: boolean;
    },
    @Request() req: { user: { userId: string } },
  ) {
    return this.spacesService.update(id, req.user.userId, body);
  }

  @Delete('spaces/:id')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.spacesService.remove(id, req.user.userId);
  }

  // ── Membership ──────────────────────────────────────

  @Post('spaces/:id/join')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async join(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.spacesService.join(id, req.user.userId);
  }

  @Delete('spaces/:id/leave')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async leave(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.spacesService.leave(id, req.user.userId);
  }

  @Get('spaces/:id/members')
  @UseGuards(OptionalJwtAuthGuard)
  async getMembers(@Param('id') id: string) {
    return this.spacesService.getMembers(id);
  }
}
