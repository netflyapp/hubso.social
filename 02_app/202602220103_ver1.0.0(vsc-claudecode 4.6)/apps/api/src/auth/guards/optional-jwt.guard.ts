import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT Guard — nie rzuca błędu gdy brak tokenu lub token jest nieważny.
 * Ustawia req.user = undefined zamiast 401.
 * Gdy token jest poprawny — req.user jest ustawiony normalnie.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Próbuj uwierzytelnić — jeśli się uda, req.user zostanie ustawiony
      return (await super.canActivate(context)) as boolean;
    } catch {
      // Brak tokenu lub nieważny token — zezwól na dostęp (req.user = undefined)
      return true;
    }
  }

  handleRequest<TUser = unknown>(_err: unknown, user: TUser): TUser {
    // Zwróć usera lub undefined (bez rzucania wyjątku)
    return user ?? (undefined as TUser);
  }
}
