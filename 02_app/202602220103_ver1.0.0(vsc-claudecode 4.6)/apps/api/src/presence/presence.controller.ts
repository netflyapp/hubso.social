import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PresenceService } from './presence.service';

@Controller('presence')
@UseGuards(AuthGuard('jwt'))
export class PresenceController {
  constructor(private readonly presence: PresenceService) {}

  /**
   * GET /users/presence?ids=id1,id2,id3
   * Returns online status for given user IDs
   */
  @Get()
  async getPresence(@Query('ids') ids: string) {
    const userIds = ids ? ids.split(',').filter(Boolean) : [];
    return this.presence.getPresence(userIds);
  }

  /**
   * GET /users/presence/me — check own online status
   */
  @Get('me')
  async myPresence(@Request() req: any) {
    const isOnline = await this.presence.isOnline(req.user.userId);
    return { userId: req.user.userId, online: isOnline };
  }
}
