import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { PostsService } from './posts.service';
import { createPostSchema } from '@hubso/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { CreatePostInput } from '@hubso/shared';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /** GET /posts/feed */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('posts/feed')
  getFeed(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Request() req: any,
  ) {
    return this.postsService.findFeed(page, Math.min(limit, 50), req.user?.userId);
  }

  /** GET /posts/:id */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('posts/:id')
  getOne(@Param('id') id: string, @Request() req: any) {
    return this.postsService.findOne(id, req.user?.userId);
  }

  /** GET /communities/:slug/posts */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('communities/:slug/posts')
  getByCommunity(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postsService.findByCommunity(slug, page, Math.min(limit, 50));
  }

  /** POST /communities/:slug/posts */
  @UseGuards(AuthGuard('jwt'))
  @Post('communities/:slug/posts')
  @HttpCode(HttpStatus.CREATED)
  createPost(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(createPostSchema)) body: CreatePostInput,
    @Request() req: any,
  ) {
    return this.postsService.create(slug, body, req.user.userId);
  }

  /** DELETE /posts/:id */
  @UseGuards(AuthGuard('jwt'))
  @Delete('posts/:id')
  @HttpCode(HttpStatus.OK)
  removePost(@Param('id') id: string, @Request() req: any) {
    return this.postsService.remove(id, req.user.userId);
  }
}
