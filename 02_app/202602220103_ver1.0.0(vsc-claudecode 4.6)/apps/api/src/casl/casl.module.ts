import { Module, Global } from '@nestjs/common';
import { CaslAbilityService } from './casl-ability.service';
import { PoliciesGuard } from './policies.guard';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * CaslModule — global module providing CASL ability service and policies guard.
 *
 * Being @Global(), it's available to all modules without explicit import.
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [CaslAbilityService, PoliciesGuard],
  exports: [CaslAbilityService, PoliciesGuard],
})
export class CaslModule {}
