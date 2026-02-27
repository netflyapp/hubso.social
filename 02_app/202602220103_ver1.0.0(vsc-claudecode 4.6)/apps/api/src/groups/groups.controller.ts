import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  // GET /groups?communityId=xxx
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findByCommunity(
    @Query('communityId') communityId: string,
    @Request() req: { user?: { userId: string } },
  ) {
    return this.groupsService.findByCommunity(communityId, req.user?.userId);
  }

  // GET /groups/:id
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findById(
    @Param('id') id: string,
    @Request() req: { user?: { userId: string } },
  ) {
    return this.groupsService.findById(id, req.user?.userId);
  }

  // POST /groups
  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(
    @Body()
    body: {
      communityId: string;
      name: string;
      description?: string;
      visibility?: 'PUBLIC' | 'PRIVATE' | 'HIDDEN';
      rules?: string;
    },
    @Request() req: { user: { userId: string } },
  ) {
    return this.groupsService.create(
      body.communityId,
      req.user.userId,
      body.name,
      body.description,
      body.visibility,
      body.rules,
    );
  }

  // PATCH /groups/:id
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      description: string;
      visibility: 'PUBLIC' | 'PRIVATE' | 'HIDDEN';
      rules: string;
    }>,
    @Request() req: { user: { userId: string } },
  ) {
    return this.groupsService.update(id, req.user.userId, body);
  }

  // DELETE /groups/:id
  @Delete(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async delete(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.groupsService.delete(id, req.user.userId);
  }

  // POST /groups/:id/join
  @Post(':id/join')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async join(
    @Param('id') groupId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.groupsService.join(groupId, req.user.userId);
  }

  // DELETE /groups/:id/leave
  @Delete(':id/leave')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async leave(
    @Param('id') groupId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.groupsService.leave(groupId, req.user.userId);
  }

  // GET /groups/:id/members
  @Get(':id/members')
  @UseGuards(OptionalJwtAuthGuard)
  async listMembers(
    @Param('id') groupId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.groupsService.listMembers(groupId, page, limit);
  }

  // DELETE /groups/:id/members/:userId
  @Delete(':id/members/:userId')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async removeMember(
    @Param('id') groupId: string,
    @Param('userId') targetUserId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.groupsService.removeMember(groupId, req.user.userId, targetUserId);
  }
}
