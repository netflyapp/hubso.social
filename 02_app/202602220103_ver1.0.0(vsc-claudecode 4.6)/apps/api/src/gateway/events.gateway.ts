import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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

  constructor(private jwtService: JwtService) {}

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

      // Broadcast user online status
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

      // Broadcast user offline status
      this.server.to(`community:${socket.communityId}`).emit('user:offline', {
        userId: socket.userId,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Message events: client sends "messages:send" with payload
   */
  @SubscribeMessage('messages:send')
  handleSendMessage(socket: AuthenticatedSocket, data: any) {
    const { conversationId, content, type = 'text' } = data;

    if (!conversationId || !content) {
      this.logger.warn(`[MSG] Invalid message payload from ${socket.userId}`);
      return;
    }

    const message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: socket.userId,
      content,
      type,
      timestamp: new Date(),
      read: false,
    };

    // Emit to conversation participants
    this.server.to(`conversation:${conversationId}`).emit('messages:receive', message);

    this.logger.log(`[MSG] Message from ${socket.userId} → conversation ${conversationId}`);
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
