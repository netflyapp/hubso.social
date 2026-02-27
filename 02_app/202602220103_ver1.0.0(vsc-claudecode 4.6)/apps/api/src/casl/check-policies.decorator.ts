import { SetMetadata } from '@nestjs/common';
import { Actions, Subjects } from './casl-ability.factory';

export const CHECK_POLICIES_KEY = 'check_policies';

/**
 * Policy handler interface — object or function.
 */
export interface IPolicyHandler {
  action: Actions;
  subject: Subjects;
}

/**
 * @CheckPolicies(action, subject) — decorator for declarative permission checks.
 *
 * Usage:
 *   @CheckPolicies('delete', 'Post')
 *   @UseGuards(AuthGuard('jwt'), PoliciesGuard)
 *   async deletePost() { ... }
 */
export const CheckPolicies = (action: Actions, subject: Subjects) =>
  SetMetadata(CHECK_POLICIES_KEY, { action, subject } as IPolicyHandler);
