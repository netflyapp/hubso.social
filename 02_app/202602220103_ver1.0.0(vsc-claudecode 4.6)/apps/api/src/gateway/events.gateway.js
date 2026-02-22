"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(EventsGateway_1.name);
    }
    /**
     * Handle new WebSocket connection
     * JWT token extracted from handshake query or auth header
     */
    async handleConnection(socket) {
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
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            this.logger.error(`[CONNECT] JWT verification failed: ${msg}`);
            socket.disconnect();
        }
    }
    /**
     * Handle WebSocket disconnection
     */
    handleDisconnect(socket) {
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
    handleSendMessage(socket, data) {
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
    handleTyping(socket, data) {
        const { conversationId } = data;
        if (!conversationId)
            return;
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
    handleConversationJoin(socket, data) {
        const { conversationId } = data;
        if (!conversationId)
            return;
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
    handleConversationLeave(socket, data) {
        const { conversationId } = data;
        if (!conversationId)
            return;
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
    emitNotification(userId, notification) {
        this.server.to(`user:${userId}`).emit('notifications:receive', notification);
    }
    /**
     * Broadcast to community
     */
    broadcastToCommunity(communityId, event, data) {
        this.server.to(`community:${communityId}`).emit(event, data);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('messages:send'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('messages:typing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation:join'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleConversationJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('conversation:leave'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleConversationLeave", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.WEB_URL || 'http://localhost:3000',
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map