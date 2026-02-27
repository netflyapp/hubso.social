import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY, IPolicyHandler } from './check-policies.decorator';
import { CaslAbilityService } from './casl-ability.service';

/**
 * PoliciesGuard — NestJS guard that enforces CASL policies.
 *
 * Can work in two modes:
 * 1. Declarative: @CheckPolicies('create', 'Post') — checks platform-level ability
 * 2. Programmatic: services call caslAbilityService directly for fine-grained checks
 *
 * Usage:
 *   @UseGuards(AuthGuard('jwt'), PoliciesGuard)
 *   @CheckPolicies('manage', 'Community')
 *   async adminMethod() { ... }
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityService: CaslAbilityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandler = this.reflector.get<IPolicyHandler>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    );

    // No policy defined → allow (guard is opt-in)
    if (!policyHandler) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Authentication required.');
    }

    const ability = await this.caslAbilityService.forUser(user.userId);

    if (!ability.can(policyHandler.action, policyHandler.subject)) {
      throw new ForbiddenException(
        `You do not have permission to ${policyHandler.action} ${policyHandler.subject}.`,
      );
    }

    return true;
  }
}
