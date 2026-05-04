import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * Blocks the decorated endpoint when running in a production environment
 * (NODE_ENV === 'production'). Use this on dev/test-only endpoints that must
 * never be reachable in production.
 */
@Injectable()
export class NonProductionGuard implements CanActivate {
    canActivate(_context: ExecutionContext): boolean {
        if (process.env.NODE_ENV === 'production') {
            throw new ForbiddenException('This endpoint is not available in production.');
        }
        return true;
    }
}
