import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { CreateCommunityInput } from '@hubso/shared';

@ApiTags('communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private communitiesService: CommunitiesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@Request() req: { user?: { userId: string } }) {
    const userId = req.user?.userId;
    return this.communitiesService.findAll(userId);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  async getBySlug(
    @Param('slug') slug: string,
    @Request() req: { user?: { userId: string } },
  ) {
    const userId = req.user?.userId;
    return this.communitiesService.findBySlug(slug, userId);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(
    @Body() input: CreateCommunityInput,
    @Request() req: { user: { userId: string } },
  ) {
    return this.communitiesService.create(input, req.user.userId);
  }

  @Post(':slug/join')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async join(
    @Param('slug') slug: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.communitiesService.join(slug, req.user.userId);
  }

  @Delete(':slug/leave')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async leave(
    @Param('slug') slug: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.communitiesService.leave(slug, req.user.userId);
  }
}
