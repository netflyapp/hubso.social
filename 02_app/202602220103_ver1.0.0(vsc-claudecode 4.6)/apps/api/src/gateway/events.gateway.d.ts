import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    communityId?: string;
}
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private logger;
    constructor(jwtService: JwtService);
    /**
     * Handle new WebSocket connection
     * JWT token extracted from handshake query or auth header
     */
    handleConnection(socket: AuthenticatedSocket): Promise<void>;
    /**
     * Handle WebSocket disconnection
     */
    handleDisconnect(socket: AuthenticatedSocket): void;
    /**
     * Message events: client sends "messages:send" with payload
     */
    handleSendMessage(socket: AuthenticatedSocket, data: any): void;
    /**
     * Typing indicator: user typing in conversation
     */
    handleTyping(socket: AuthenticatedSocket, data: any): void;
    /**
     * User joins a conversation room
     * Allows them to receive messages from that conversation
     */
    handleConversationJoin(socket: AuthenticatedSocket, data: any): void;
    /**
     * User leaves a conversation room
     */
    handleConversationLeave(socket: AuthenticatedSocket, data: any): void;
    /**
     * Notifications: emit to specific user
     */
    emitNotification(userId: string, notification: any): void;
    /**
     * Broadcast to community
     */
    broadcastToCommunity(communityId: string, event: string, data: any): void;
}
export {};
//# sourceMappingURL=events.gateway.d.ts.map