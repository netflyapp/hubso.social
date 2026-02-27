import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const PARTICIPANT_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
};

const MESSAGE_SELECT = {
  id: true,
  conversationId: true,
  senderId: true,
  content: true,
  type: true,
  parentId: true,
  readAt: true,
  createdAt: true,
  updatedAt: true,
  sender: { select: PARTICIPANT_SELECT },
};

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  /**
   * List all conversations for a user, with last message preview
   */
  async getConversations(userId: string) {
    const participations = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: PARTICIPANT_SELECT } },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: MESSAGE_SELECT,
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return participations.map((p) => {
      const conv = p.conversation;
      const lastMessage = conv.messages[0] ?? null;

      // For DM: the "other" participant is the one who is not me
      const others = conv.participants
        .filter((cp) => cp.userId !== userId)
        .map((cp) => cp.user);

      // Unread count
      const unreadCount = 0; // loaded lazily — computed on demand

      return {
        id: conv.id,
        type: conv.type,
        name: conv.name,
        avatarUrl: (conv as any).avatarUrl ?? null,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        participants: conv.participants.map((cp) => cp.user),
        otherParticipants: others,
        lastMessage,
        unreadCount,
      };
    });
  }

  /**
   * Get or create a 1:1 DM conversation between two users
   */
  async getOrCreateDm(userId: string, recipientId: string) {
    if (userId === recipientId) {
      throw new BadRequestException('Nie możesz rozpocząć rozmowy ze sobą');
    }

    // Check recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
      select: PARTICIPANT_SELECT,
    });
    if (!recipient) throw new NotFoundException('Użytkownik nie istnieje');

    // Look for existing DIRECT conversation between exactly these two users
    const existing = await this.prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        participants: {
          every: { userId: { in: [userId, recipientId] } },
        },
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
      include: {
        participants: { include: { user: { select: PARTICIPANT_SELECT } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: MESSAGE_SELECT },
      },
    });

    if (existing) {
      return this._mapConversation(existing, userId);
    }

    // Create new DM
    const conversation = await this.prisma.conversation.create({
      data: {
        type: 'DIRECT',
        participants: {
          create: [{ userId }, { userId: recipientId }],
        },
      },
      include: {
        participants: { include: { user: { select: PARTICIPANT_SELECT } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: MESSAGE_SELECT },
      },
    });

    return this._mapConversation(conversation, userId);
  }

  /**
   * Get messages for a conversation (cursor-based pagination)
   */
  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit = 50,
  ) {
    // Verify user is a participant
    await this._assertParticipant(conversationId, userId);

    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      select: MESSAGE_SELECT,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    // Mark unread messages by others as read
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return {
      messages: messages.reverse(),
      nextCursor: hasMore ? messages[0]?.id ?? null : null,
      hasMore,
    };
  }

  /**
   * Send a message (REST path — Socket.io also calls this)
   * sendEmailNotification: optionally notify offline participants
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | 'VIDEO' = 'TEXT',
    sendEmailNotification = false,
  ) {
    // Verify sender is participant
    await this._assertParticipant(conversationId, senderId);

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        type,
      },
      select: MESSAGE_SELECT,
    });

    // Touch conversation updatedAt
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Optional email notification (fire-and-forget)
    if (sendEmailNotification) {
      this._notifyParticipantsByEmail(conversationId, senderId, content).catch(() => {});
    }

    return message;
  }

  // ─── Group Chat ─────────────────────────────────────────────────────────────

  /**
   * Create a group conversation
   */
  async createGroup(creatorId: string, name: string, participantIds: string[]) {
    if (!name || name.trim().length < 1) {
      throw new BadRequestException('Nazwa grupy jest wymagana');
    }
    const allIds = [...new Set([creatorId, ...participantIds])];
    if (allIds.length < 2) {
      throw new BadRequestException('Grupa wymaga co najmniej 2 uczestników');
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: allIds } },
      select: PARTICIPANT_SELECT,
    });
    if (users.length !== allIds.length) {
      throw new NotFoundException('Jeden lub więcej użytkowników nie istnieje');
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        type: 'GROUP',
        name: name.trim(),
        participants: {
          create: allIds.map((userId) => ({ userId })),
        },
      },
      include: {
        participants: { include: { user: { select: PARTICIPANT_SELECT } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: MESSAGE_SELECT },
      },
    });

    return this._mapConversation(conversation, creatorId);
  }

  /**
   * Update group name / avatarUrl
   */
  async updateGroup(
    conversationId: string,
    userId: string,
    data: { name?: string; avatarUrl?: string },
  ) {
    await this._assertParticipant(conversationId, userId);

    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || conv.type !== 'GROUP') {
      throw new BadRequestException('Nie jest to konwersacja grupowa');
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
    });
  }

  /**
   * Add participant to group
   */
  async addParticipant(conversationId: string, requestorId: string, userId: string) {
    await this._assertParticipant(conversationId, requestorId);

    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || conv.type !== 'GROUP') {
      throw new BadRequestException('Nie jest to konwersacja grupowa');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PARTICIPANT_SELECT,
    });
    if (!user) throw new NotFoundException('Użytkownik nie istnieje');

    const existing = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (existing) return { message: 'Użytkownik już jest uczestnikiem' };

    await this.prisma.conversationParticipant.create({
      data: { conversationId, userId },
    });

    return { added: true, user };
  }

  /**
   * Remove participant from group
   */
  async removeParticipant(conversationId: string, requestorId: string, userId: string) {
    await this._assertParticipant(conversationId, requestorId);

    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || conv.type !== 'GROUP') {
      throw new BadRequestException('Nie jest to konwersacja grupowa');
    }

    await this.prisma.conversationParticipant.deleteMany({
      where: { conversationId, userId },
    });

    return { removed: true };
  }

  /**
   * Leave a group conversation (self-removal)
   */
  async leaveGroup(conversationId: string, userId: string) {
    await this._assertParticipant(conversationId, userId);

    const conv = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || conv.type !== 'GROUP') {
      throw new BadRequestException('Nie jest to konwersacja grupowa');
    }

    await this.prisma.conversationParticipant.deleteMany({
      where: { conversationId, userId },
    });

    return { left: true };
  }

  // ─── Read Receipts ───────────────────────────────────────────────────────────

  /**
   * Mark all messages in a conversation as read (REST endpoint)
   */
  async markConversationRead(conversationId: string, userId: string) {
    await this._assertParticipant(conversationId, userId);

    const result = await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return { markedRead: result.count, conversationId };
  }

  /**
   * Delete a message (own messages only)
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Wiadomość nie istnieje');
    if (message.senderId !== userId)
      throw new ForbiddenException('Nie możesz usunąć cudzej wiadomości');

    await this.prisma.message.delete({ where: { id: messageId } });
    return { deleted: true };
  }

  /**
   * Get unread counts per conversation for a user
   */
  async getUnreadCounts(userId: string): Promise<Record<string, number>> {
    const counts = await this.prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        conversation: { participants: { some: { userId } } },
        senderId: { not: userId },
        readAt: null,
      },
      _count: { id: true },
    });

    return Object.fromEntries(counts.map((c) => [c.conversationId, c._count.id]));
  }

  // ─── private helpers ───────────────────────────────────────────────────────

  private async _assertParticipant(conversationId: string, userId: string) {
    const participation = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participation) {
      throw new ForbiddenException('Nie jesteś uczestnikiem tej rozmowy');
    }
    return participation;
  }

  private _mapConversation(conv: any, userId: string) {
    const others = conv.participants
      .filter((cp: any) => cp.userId !== userId)
      .map((cp: any) => cp.user);

    return {
      id: conv.id,
      type: conv.type,
      name: conv.name,
      avatarUrl: conv.avatarUrl ?? null,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      participants: conv.participants.map((cp: any) => cp.user),
      otherParticipants: others,
      lastMessage: conv.messages[0] ?? null,
    };
  }

  /**
   * Fire-and-forget: send email to offline participants when they receive a message
   */
  private async _notifyParticipantsByEmail(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<void> {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: { user: { select: { id: true, email: true, displayName: true, username: true } } },
        },
      },
    });

    if (!conv) return;

    const sender = conv.participants.find((p) => p.userId === senderId)?.user;
    if (!sender) return;

    const senderName = sender.displayName || sender.username;
    const preview = content.length > 80 ? content.slice(0, 80) + '...' : content;

    for (const p of conv.participants) {
      if (p.userId === senderId) continue;
      if (!p.user.email) continue;

      await this.mail.sendNewMessageNotification({
        to: p.user.email,
        recipientName: p.user.displayName || p.user.username,
        senderName,
        preview,
      });
    }
  }
}

