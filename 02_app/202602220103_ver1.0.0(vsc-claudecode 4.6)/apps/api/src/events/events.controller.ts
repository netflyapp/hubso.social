import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  UseGuards,
  Request,
  Res,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { EventsService } from './events.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  // GET /events?spaceId=xxx
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findBySpace(
    @Query('spaceId') spaceId: string,
    @Request() req: { user?: { userId: string } },
  ) {
    return this.eventsService.findBySpace(spaceId, req.user?.userId);
  }

  // GET /events/upcoming — events across all user's communities
  @Get('upcoming')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async findUpcoming(@Request() req: { user: { userId: string } }) {
    return this.eventsService.findUpcoming(req.user.userId);
  }

  // GET /events/:id
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findById(
    @Param('id') id: string,
    @Request() req: { user?: { userId: string } },
  ) {
    return this.eventsService.findById(id, req.user?.userId);
  }

  // GET /events/:id/ical
  @Get(':id/ical')
  async getIcal(@Param('id') id: string, @Res() res: Response) {
    const event = await this.eventsService.findById(id);
    const ical = this.eventsService.buildIcal({
      id: event.id as string,
      title: event.title as string,
      description: event.description as string | null,
      startsAt: new Date(event.startsAt as string),
      endsAt: new Date(event.endsAt as string),
      location: event.location as string | null,
    });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="event-${id}.ics"`,
    );
    res.send(ical);
  }

  // GET /events/:id/attendees
  @Get(':id/attendees')
  @UseGuards(OptionalJwtAuthGuard)
  async listAttendees(
    @Param('id') eventId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.eventsService.listAttendees(eventId, page, limit);
  }

  // POST /events
  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async create(
    @Body()
    body: {
      spaceId: string;
      title: string;
      description?: string;
      startsAt: string;
      endsAt: string;
      locationType?: 'VIRTUAL' | 'IN_PERSON' | 'HYBRID';
      location?: string;
      maxAttendees?: number;
      ticketPrice?: number;
    },
    @Request() req: { user: { userId: string } },
  ) {
    const { spaceId, ...input } = body;
    return this.eventsService.create(spaceId, req.user.userId, input);
  }

  // PATCH /events/:id
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      title: string;
      description: string;
      startsAt: string;
      endsAt: string;
      locationType: 'VIRTUAL' | 'IN_PERSON' | 'HYBRID';
      location: string;
      maxAttendees: number;
      ticketPrice: number;
    }>,
    @Request() req: { user: { userId: string } },
  ) {
    return this.eventsService.update(id, req.user.userId, body);
  }

  // DELETE /events/:id
  @Delete(':id')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async delete(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.eventsService.delete(id, req.user.userId);
  }

  // POST /events/:id/rsvp
  @Post(':id/rsvp')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async rsvp(
    @Param('id') eventId: string,
    @Body() body: { status: 'GOING' | 'MAYBE' | 'NOT_GOING' },
    @Request() req: { user: { userId: string } },
  ) {
    return this.eventsService.rsvp(eventId, req.user.userId, body.status);
  }

  // DELETE /events/:id/rsvp
  @Delete(':id/rsvp')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async cancelRsvp(
    @Param('id') eventId: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.eventsService.cancelRsvp(eventId, req.user.userId);
  }
}
