import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createCommentSchema } from '@hubso/shared';

interface CreateCommentBody {
  content: string;
  parentId?: string;
}

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('posts/:postId/comments')
  getByPost(@Param('postId') postId: string) {
    return this.commentsService.getByPost(postId);
  }

  @Post('posts/:postId/comments')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('postId') postId: string,
    @Body(new ZodValidationPipe(createCommentSchema)) body: CreateCommentBody,
    @Request() req: any,
  ) {
    return this.commentsService.create(postId, req.user.userId, body);
  }

  @Delete('comments/:id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.delete(id, req.user.userId);
  }
}
