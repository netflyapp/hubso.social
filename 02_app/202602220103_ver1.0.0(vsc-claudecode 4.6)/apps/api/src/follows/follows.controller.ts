import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FollowsService } from './follows.service';

@Controller('users')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':id/follow')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async follow(@Param('id') targetId: string, @Request() req: any) {
    return this.followsService.follow(req.user.userId, targetId);
  }

  @Delete(':id/follow')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async unfollow(@Param('id') targetId: string, @Request() req: any) {
    return this.followsService.unfollow(req.user.userId, targetId);
  }

  @Get(':id/followers')
  async getFollowers(@Param('id') userId: string, @Request() req: any) {
    const requesterId = req.user?.userId;
    return this.followsService.getFollowers(userId, requesterId);
  }

  @Get(':id/following')
  async getFollowing(@Param('id') userId: string, @Request() req: any) {
    const requesterId = req.user?.userId;
    return this.followsService.getFollowing(userId, requesterId);
  }
}
