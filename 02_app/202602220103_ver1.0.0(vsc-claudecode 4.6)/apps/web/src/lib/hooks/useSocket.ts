import { useEffect, useRef, useCallback, useState } from 'react';
import { socketService } from '@/lib/socket';
import { useAuthStore } from '@/stores/useAuthStore';

interface UseSocketEvents {
  onMessageReceived?: (message: any) => void;
  onTypingIndicator?: (data: any) => void;
  onUserOnline?: (data: any) => void;
  onUserOffline?: (data: any) => void;
  onConversationUserJoined?: (data: any) => void;
  onConversationUserLeft?: (data: any) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: any) => void;
}

export function useSocket(events?: UseSocketEvents) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isConnected, setIsConnected] = useState(false);
  const connectTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize socket connection
  useEffect(() => {
    if (!accessToken) {
      // If no token, disconnect if already connected
      if (socketService.isConnected()) {
        socketService.disconnect();
      }
      return;
    }

    // Connect with token
    socketService.connect(accessToken);

    // Subscribe to internal events
    const unsubscribeConnected = socketService.subscribe('connected', () => {
      setIsConnected(true);
      events?.onConnected?.();
    });

    const unsubscribeDisconnected = socketService.subscribe('disconnected', () => {
      setIsConnected(false);
      events?.onDisconnected?.();

      // Attempt reconnect after 5 seconds
      connectTimeoutRef.current = setTimeout(() => {
        if (accessToken && !socketService.isConnected()) {
          socketService.connect(accessToken);
        }
      }, 5000);
    });

    const unsubscribeError = socketService.subscribe('error', (data) => {
      events?.onError?.(data.error);
    });

    // Subscribe to server events
    socketService.on('messages:receive', events?.onMessageReceived || (() => {}));
    socketService.on('messages:typing-indicator', events?.onTypingIndicator || (() => {}));
    socketService.on('user:online', events?.onUserOnline || (() => {}));
    socketService.on('user:offline', events?.onUserOffline || (() => {}));
    socketService.on('conversation:user-joined', events?.onConversationUserJoined || (() => {}));
    socketService.on('conversation:user-left', events?.onConversationUserLeft || (() => {}));

    // Cleanup
    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeError();
    };
  }, [accessToken, events]);

  // Emit message
  const sendMessage = useCallback((conversationId: string, content: string) => {
    socketService.sendMessage(conversationId, content);
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((conversationId: string) => {
    socketService.sendTyping(conversationId);
  }, []);

  // Join conversation
  const joinConversation = useCallback((conversationId: string) => {
    socketService.joinConversation(conversationId);
  }, []);

  // Leave conversation
  const leaveConversation = useCallback((conversationId: string) => {
    socketService.leaveConversation(conversationId);
  }, []);

  // Direct emit (for custom events)
  const emit = useCallback((event: string, data?: any) => {
    socketService.emit(event, data);
  }, []);

  return {
    isConnected,
    sendMessage,
    sendTyping,
    joinConversation,
    leaveConversation,
    emit,
  };
}
