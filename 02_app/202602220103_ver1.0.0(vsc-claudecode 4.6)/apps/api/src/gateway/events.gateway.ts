import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../messages/messages.service';
import { PresenceService } from '../presence/presence.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  communityId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private logger = new Logger(EventsGateway.name);

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
    private presenceService: PresenceService,
  ) {}

  /**
   * Handle new WebSocket connection
   * JWT token extracted from handshake query or auth header
   */
  async handleConnection(socket: AuthenticatedSocket) {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      this.logger.warn(`[CONNECT] Connection rejected: no token`);
      socket.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      socket.userId = payload.sub;
      socket.communityId = payload.communityId || 'default';

      this.logger.log(`[CONNECT] User ${socket.userId} connected (socket: ${socket.id})`);

      // Join user-specific room (for DMs, notifications)
      socket.join(`user:${socket.userId}`);

      // Join community room (for shared events)
      socket.join(`community:${socket.communityId}`);

      // Mark online in Redis
      await this.presenceService.setOnline(socket.userId!);

      // Broadcast user online status
      this.server.to(`community:${socket.communityId}`).emit('presence:update', {
        userId: socket.userId,
        online: true,
        timestamp: new Date(),
      });
      // legacy event for backwards compat
      this.server.to(`community:${socket.communityId}`).emit('user:online', {
        userId: socket.userId,
        timestamp: new Date(),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[CONNECT] JWT verification failed: ${msg}`);
      socket.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  handleDisconnect(socket: AuthenticatedSocket) {
    if (socket.userId) {
      this.logger.log(`[DISCONNECT] User ${socket.userId} disconnected (socket: ${socket.id})`);

      // Mark offline in Redis (fire-and-forget)
      this.presenceService.setOffline(socket.userId).catch(() => {});

      // Broadcast user offline status
      this.server.to(`community:${socket.communityId}`).emit('presence:update', {
        userId: socket.userId,
        online: false,
        timestamp: new Date(),
      });
      this.server.to(`community:${socket.communityId}`).emit('user:offline', {
        userId: socket.userId,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Message events: persists to DB then broadcasts to conversation room
   */
  @SubscribeMessage('messages:send')
  async handleSendMessage(socket: AuthenticatedSocket, data: any) {
    const { conversationId, content, type = 'TEXT' } = data;

    if (!conversationId || !content || !socket.userId) {
      this.logger.warn(`[MSG] Invalid message payload from ${socket.userId}`);
      return;
    }

    try {
      const message = await this.messagesService.sendMessage(
        conversationId,
        socket.userId,
        content,
        type.toUpperCase() as 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO',
      );

      this.server
        .to(`conversation:${conversationId}`)
        .emit('messages:receive', message);

      this.logger.log(
        `[MSG] User ${socket.userId} → conversation ${conversationId} (id: ${message.id})`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`[MSG] Failed to save message: ${msg}`);
      socket.emit('messages:error', { error: msg });
    }
  }

  /**
   * Typing indicator: user typing in conversation
   */
  @SubscribeMessage('messages:typing')
  handleTyping(socket: AuthenticatedSocket, data: any) {
    const { conversationId } = data;

    if (!conversationId) return;

    this.server.to(`conversation:${conversationId}`).emit('messages:typing-indicator', {
      userId: socket.userId,
      conversationId,
      isTyping: true,
    });

    // Auto-reset after 3 seconds (client should re-emit if still typing)
    setTimeout(() => {
      this.server.to(`conversation:${conversationId}`).emit('messages:typing-indicator', {
        userId: socket.userId,
        conversationId,
        isTyping: false,
      });
    }, 3000);
  }

  /**
   * User joins a conversation room
   * Allows them to receive messages from that conversation
   */
  @SubscribeMessage('conversation:join')
  handleConversationJoin(socket: AuthenticatedSocket, data: any) {
    const { conversationId } = data;

    if (!conversationId) return;

    socket.join(`conversation:${conversationId}`);

    this.logger.log(`[CONV] User ${socket.userId} joined conversation ${conversationId}`);

    // Notify others in conversation
    this.server.to(`conversation:${conversationId}`).emit('conversation:user-joined', {
      userId: socket.userId,
      conversationId,
      timestamp: new Date(),
    });
  }

  /**
   * User leaves a conversation room
   */
  @SubscribeMessage('conversation:leave')
  handleConversationLeave(socket: AuthenticatedSocket, data: any) {
    const { conversationId } = data;

    if (!conversationId) return;

    socket.leave(`conversation:${conversationId}`);

    this.logger.log(`[CONV] User ${socket.userId} left conversation ${conversationId}`);

    this.server.to(`conversation:${conversationId}`).emit('conversation:user-left', {
      userId: socket.userId,
      conversationId,
      timestamp: new Date(),
    });
  }

  /**
   * Presence heartbeat — client sends every ~30s to keep online status alive
   */
  @SubscribeMessage('presence:heartbeat')
  async handleHeartbeat(socket: AuthenticatedSocket) {
    if (!socket.userId) return;
    await this.presenceService.heartbeat(socket.userId);
    socket.emit('presence:heartbeat:ack', { timestamp: new Date() });
  }

  /**
   * Mark conversation messages as read (socket-based read receipt)
   * Emits 'messages:read' back to conversation room so other participants know
   */
  @SubscribeMessage('messages:read')
  async handleMarkRead(socket: AuthenticatedSocket, data: any) {
    const { conversationId } = data;
    if (!conversationId || !socket.userId) return;

    try {
      const result = await this.messagesService.markConversationRead(
        conversationId,
        socket.userId,
      );

      // Notify all participants that messages were read
      this.server.to(`conversation:${conversationId}`).emit('messages:read:ack', {
        conversationId,
        readByUserId: socket.userId,
        markedRead: result.markedRead,
        timestamp: new Date(),
      });
    } catch {
      // ignore (e.g. not a participant)
    }
  }

  /**
   * Notifications: emit to specific user
   */
  emitNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notifications:receive', notification);
  }

  /**
   * Broadcast to community
   */
  broadcastToCommunity(communityId: string, event: string, data: any) {
    this.server.to(`community:${communityId}`).emit(event, data);
  }
}
