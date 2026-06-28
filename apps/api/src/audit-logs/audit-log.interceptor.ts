import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);
const STAFF_ROLES = new Set(['MODERATOR', 'ADMIN', 'SUPER_ADMIN']);
const REDACTED_KEYS = new Set(['password', 'passwordHash', 'token', 'accessToken', 'refreshToken']);

function redact(body: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, REDACTED_KEYS.has(k) ? '[redacted]' : v]),
  );
}

// Records every mutating request made by staff so admins can audit who
// changed what, without needing direct database access.
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!MUTATING_METHODS.has(req.method) || !user?.role || !STAFF_ROLES.has(user.role)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => this.record(req, user, 200),
        error: (err) => this.record(req, user, err?.status ?? 500),
      }),
    );
  }

  private record(req: any, user: { id: string; role: string }, statusCode: number) {
    this.prisma.auditLog
      .create({
        data: {
          actorId: user.id,
          actorRole: user.role,
          method: req.method,
          path: req.url,
          statusCode,
          metadata: Object.keys(req.body ?? {}).length ? { body: redact(req.body) } : undefined,
        },
      })
      .catch((err) => this.logger.error('Failed to write audit log', err));
  }
}
