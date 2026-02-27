import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';

class SendMessageDto {
  content!: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO';
}

class CreateDmDto {
  recipientId!: string;
}

class CreateGroupDto {
  name!: string;
  participantIds!: string[];
}

class UpdateGroupDto {
  name?: string;
  avatarUrl?: string;
}

class AddParticipantDto {
  userId!: string;
}

@Controller()
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  /** GET /conversations — list my conversations */
  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messages.getConversations(req.user.userId);
  }

  /** POST /conversations/dm — get or create a 1:1 DM */
  @Post('conversations/dm')
  getOrCreateDm(@Request() req: any, @Body() dto: CreateDmDto) {
    return this.messages.getOrCreateDm(req.user.userId, dto.recipientId);
  }

  /** POST /conversations/group — create a group conversation */
  @Post('conversations/group')
  createGroup(@Request() req: any, @Body() dto: CreateGroupDto) {
    return this.messages.createGroup(req.user.userId, dto.name, dto.participantIds ?? []);
  }

  /** GET /conversations/unread — unread count per conversation */
  @Get('conversations/unread')
  getUnreadCounts(@Request() req: any) {
    return this.messages.getUnreadCounts(req.user.userId);
  }

  /** GET /conversations/:id/messages */
  @Get('conversations/:id/messages')
  getMessages(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messages.getMessages(
      conversationId,
      req.user.userId,
      cursor,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  /** POST /conversations/:id/messages — REST send (Socket.io preferred) */
  @Post('conversations/:id/messages')
  sendMessage(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messages.sendMessage(
      conversationId,
      req.user.userId,
      dto.content,
      dto.type ?? 'TEXT',
    );
  }

  /** POST /conversations/:id/read — mark all messages as read */
  @Post('conversations/:id/read')
  @HttpCode(HttpStatus.OK)
  markRead(@Request() req: any, @Param('id') conversationId: string) {
    return this.messages.markConversationRead(conversationId, req.user.userId);
  }

  /** PATCH /conversations/:id/group — update group name/avatar */
  @Patch('conversations/:id/group')
  updateGroup(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.messages.updateGroup(conversationId, req.user.userId, dto);
  }

  /** POST /conversations/:id/participants — add participant to group */
  @Post('conversations/:id/participants')
  addParticipant(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body() dto: AddParticipantDto,
  ) {
    return this.messages.addParticipant(conversationId, req.user.userId, dto.userId);
  }

  /** DELETE /conversations/:id/participants/:userId — remove participant */
  @Delete('conversations/:id/participants/:userId')
  removeParticipant(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Param('userId') userId: string,
  ) {
    return this.messages.removeParticipant(conversationId, req.user.userId, userId);
  }

  /** DELETE /conversations/:id/leave — leave group */
  @Delete('conversations/:id/leave')
  leaveGroup(@Request() req: any, @Param('id') conversationId: string) {
    return this.messages.leaveGroup(conversationId, req.user.userId);
  }

  /** DELETE /messages/:id */
  @Delete('messages/:id')
  deleteMessage(@Request() req: any, @Param('id') messageId: string) {
    return this.messages.deleteMessage(messageId, req.user.userId);
  }
}

