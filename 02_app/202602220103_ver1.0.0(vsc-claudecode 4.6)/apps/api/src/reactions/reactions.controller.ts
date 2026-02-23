import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReactionsService } from './reactions.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { toggleReactionSchema } from '@hubso/shared';
import type { ToggleReactionInput } from './reactions.service';

@Controller()
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  /** POST /reactions/toggle — utwórz / zaktualizuj / usuń reakcję */
  @UseGuards(AuthGuard('jwt'))
  @Post('reactions/toggle')
  @HttpCode(HttpStatus.OK)
  toggle(
    @Body(new ZodValidationPipe(toggleReactionSchema)) body: ToggleReactionInput,
    @Request() req: any,
  ) {
    return this.reactionsService.toggle(req.user.userId, body);
  }
}
