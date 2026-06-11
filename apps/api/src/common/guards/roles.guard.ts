import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Higher number = more privileges. A user satisfies a required role if their
// rank is >= the lowest-ranked required role (so ADMIN inherits MODERATOR access).
export const ROLE_RANK: Record<UserRole, number> = {
  USER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) return false;

    const userRank = ROLE_RANK[user.role as UserRole] ?? 0;
    const minRequired = Math.min(...requiredRoles.map((r) => ROLE_RANK[r] ?? 99));
    return userRank >= minRequired;
  }
}
