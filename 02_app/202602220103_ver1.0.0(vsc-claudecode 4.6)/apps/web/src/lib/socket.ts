import { io, Socket as SocketIO } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: SocketIO | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Initialize Socket.io connection
   */
  connect(token: string): SocketIO | null {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return this.socket;
    }

    this.socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this._emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('[Socket] Connection error:', error);
      this._emit('error', { error });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('[Socket] Disconnected:', reason);
      this._emit('disconnected', { reason });
    });

    return this.socket;
  }

  /**
   * Disconnect Socket.io
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any) {
    if (!this.socket) {
      console.error('[Socket] Not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Listen to server event
   */
  on(event: string, callback: (data?: any) => void) {
    if (!this.socket) {
      console.error('[Socket] Not connected');
      return;
    }
    this.socket.on(event, callback);
  }

  /**
   * Stop listening to event
   */
  off(event: string, callback: (data?: any) => void) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  /**
   * Internal event emitter for hook subscriptions
   */
  private _emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  /**
   * Subscribe to internal events (used by React hooks)
   */
  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Conversation Management
  joinConversation(conversationId: string) {
    this.emit('conversation:join', { conversationId });
  }

  leaveConversation(conversationId: string) {
    this.emit('conversation:leave', { conversationId });
  }

  // Messaging
  sendMessage(conversationId: string, content: string) {
    this.emit('messages:send', {
      conversationId,
      content,
      type: 'text',
    });
  }

  sendTyping(conversationId: string) {
    this.emit('messages:typing', { conversationId });
  }
}

export const socketService = new SocketService();
