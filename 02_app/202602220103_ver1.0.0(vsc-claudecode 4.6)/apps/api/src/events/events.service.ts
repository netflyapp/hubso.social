import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async findBySpace(spaceId: string, userId?: string) {
    const events = await this.prisma.event.findMany({
      where: { spaceId },
      orderBy: { startsAt: 'asc' },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        _count: { select: { attendees: true } },
        attendees: userId ? { where: { userId }, select: { status: true } } : false,
      },
    });

    return events.map((e) => this._shape(e, userId));
  }

  async findUpcoming(userId: string) {
    const now = new Date();
    const memberships = await this.prisma.communityMember.findMany({
      where: { userId },
      select: { community: { select: { spaces: { select: { id: true } } } } },
    });
    const spaceIds = memberships.flatMap((m) =>
      m.community.spaces.map((s) => s.id),
    );

    const events = await this.prisma.event.findMany({
      where: {
        spaceId: { in: spaceIds },
        startsAt: { gte: now },
      },
      orderBy: { startsAt: 'asc' },
      take: 20,
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        _count: { select: { attendees: true } },
        attendees: { where: { userId }, select: { status: true } },
      },
    });

    return events.map((e) => this._shape(e, userId));
  }

  async findById(id: string, userId?: string) {
    const e = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        _count: { select: { attendees: true } },
        attendees: userId ? { where: { userId }, select: { status: true } } : false,
      },
    });

    if (!e) throw new NotFoundException('Event not found.');
    return this._shape(e, userId);
  }

  async create(
    spaceId: string,
    creatorId: string,
    input: {
      title: string;
      description?: string;
      startsAt: string;
      endsAt: string;
      locationType?: 'VIRTUAL' | 'IN_PERSON' | 'HYBRID';
      location?: string;
      maxAttendees?: number;
      ticketPrice?: number;
    },
  ) {
    if (!input.title || input.title.trim().length < 2) {
      throw new BadRequestException('Title must be at least 2 characters.');
    }

    const starts = new Date(input.startsAt);
    const ends = new Date(input.endsAt);

    if (isNaN(starts.getTime()) || isNaN(ends.getTime())) {
      throw new BadRequestException('Invalid date format.');
    }
    if (ends <= starts) {
      throw new BadRequestException('endsAt must be after startsAt.');
    }

    // Accept either a direct spaceId or a communityId (resolve first space of that community)
    let space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      space = await this.prisma.space.findFirst({ where: { communityId: spaceId } });
    }
    if (!space) throw new NotFoundException('Space not found.');

    const event = await this.prisma.event.create({
      data: {
        spaceId: space.id,
        creatorId,
        title: input.title.trim(),
        description: input.description?.trim() ?? null,
        startsAt: starts,
        endsAt: ends,
        locationType: input.locationType ?? 'VIRTUAL',
        location: input.location?.trim() ?? null,
        maxAttendees: input.maxAttendees ?? null,
        ticketPrice: input.ticketPrice ?? null,
      },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    return event;
  }

  async update(
    id: string,
    userId: string,
    patch: Partial<{
      title: string;
      description: string;
      startsAt: string;
      endsAt: string;
      locationType: 'VIRTUAL' | 'IN_PERSON' | 'HYBRID';
      location: string;
      maxAttendees: number;
      ticketPrice: number;
    }>,
  ) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found.');
    if (event.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can update this event.');
    }

    const data: Record<string, unknown> = {};
    if (patch.title) data.title = patch.title.trim();
    if (patch.description !== undefined) data.description = patch.description.trim() || null;
    if (patch.startsAt) data.startsAt = new Date(patch.startsAt);
    if (patch.endsAt) data.endsAt = new Date(patch.endsAt);
    if (patch.locationType) data.locationType = patch.locationType;
    if (patch.location !== undefined) data.location = patch.location.trim() || null;
    if (patch.maxAttendees !== undefined) data.maxAttendees = patch.maxAttendees;
    if (patch.ticketPrice !== undefined) data.ticketPrice = patch.ticketPrice;

    return this.prisma.event.update({ where: { id }, data });
  }

  async delete(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found.');
    if (event.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can delete this event.');
    }
    await this.prisma.event.delete({ where: { id } });
    return { deleted: true };
  }

  async rsvp(eventId: string, userId: string, status: 'GOING' | 'MAYBE' | 'NOT_GOING') {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found.');

    if (event.maxAttendees && status === 'GOING') {
      const goingCount = await this.prisma.eventAttendee.count({
        where: { eventId, status: 'GOING' },
      });
      if (goingCount >= event.maxAttendees) {
        throw new ConflictException('Event is at full capacity.');
      }
    }

    const existing = await this.prisma.eventAttendee.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existing) {
      await this.prisma.eventAttendee.update({
        where: { eventId_userId: { eventId, userId } },
        data: { status },
      });
    } else {
      await this.prisma.eventAttendee.create({
        data: { eventId, userId, status },
      });
    }

    this._sendEventEmail(eventId, userId, status);

    return { rsvpStatus: status, eventId };
  }

  async cancelRsvp(eventId: string, userId: string) {
    const existing = await this.prisma.eventAttendee.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!existing) throw new NotFoundException('RSVP not found.');

    await this.prisma.eventAttendee.delete({
      where: { eventId_userId: { eventId, userId } },
    });

    return { cancelled: true, eventId };
  }

  async listAttendees(eventId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const attendees = await this.prisma.eventAttendee.findMany({
      where: { eventId },
      skip,
      take: limit,
      orderBy: { joinedAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const total = await this.prisma.eventAttendee.count({ where: { eventId } });

    return {
      attendees: attendees.map((a) => ({
        userId: a.userId,
        status: a.status,
        joinedAt: a.joinedAt,
        user: a.user,
      })),
      total,
      page,
      limit,
    };
  }

  buildIcal(event: {
    id: string;
    title: string;
    description: string | null;
    startsAt: Date;
    endsAt: Date;
    location: string | null;
  }): string {
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const escape = (s: string) =>
      s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Hubso//Hubso Social//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@hubso.social`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(event.startsAt)}`,
      `DTEND:${fmt(event.endsAt)}`,
      `SUMMARY:${escape(event.title)}`,
      event.description ? `DESCRIPTION:${escape(event.description)}` : '',
      event.location ? `LOCATION:${escape(event.location)}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n');
  }

  private _shape(
    e: Record<string, unknown> & {
      _count: { attendees: number };
      attendees?: { status: string }[] | false;
    },
    userId?: string,
  ) {
    const attendees = e.attendees;
    const myStatus =
      userId && Array.isArray(attendees) && attendees.length > 0
        ? (attendees[0]?.status ?? null)
        : null;

    return {
      id: e.id,
      title: e.title,
      description: e.description,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      locationType: e.locationType,
      location: e.location,
      maxAttendees: e.maxAttendees,
      ticketPrice: e.ticketPrice,
      spaceId: e.spaceId,
      creator: e.creator,
      attendeeCount: e._count.attendees,
      myRsvp: myStatus,
      createdAt: e.createdAt,
    };
  }

  private _sendEventEmail(eventId: string, userId: string, status: string) {
    // fire-and-forget
    this.prisma.event
      .findUnique({
        where: { id: eventId },
        include: { creator: { select: { email: true, displayName: true } } },
      })
      .then((ev) => {
        if (!ev || ev.creatorId === userId || status !== 'GOING') return;
        return this.mail.sendNotificationEmail({
          to: ev.creator.email,
          recipientName: ev.creator.displayName ?? ev.creator.email,
          title: `Ktoś dołączył do Twojego wydarzenia: ${ev.title}`,
          body: `Nowy uczestnik dołączył do wydarzenia <strong>${ev.title}</strong>.`,
          ctaText: 'Zobacz wydarzenie',
          ctaUrl: `${process.env.WEB_URL ?? 'http://localhost:3000'}/events`,
        });
      })
      .catch(() => {});
  }
}
