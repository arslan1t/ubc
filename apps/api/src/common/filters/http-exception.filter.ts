import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // @fastify/multipart throws a plain error when a file exceeds the size cap —
    // surface it as a clear 413 instead of a generic 500.
    const isFileTooLarge =
      (exception as { code?: string })?.code === 'FST_REQ_FILE_TOO_LARGE';

    const status = isFileTooLarge
      ? HttpStatus.PAYLOAD_TOO_LARGE
      : exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isFileTooLarge
      ? 'Файл слишком большой — максимум 25 МБ. Сожми фото или выбери другое.'
      : exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (status >= 500) {
      this.logger.error(exception);
    }

    reply.status(status).send({
      success: false,
      statusCode: status,
      message: typeof message === 'string' ? message : (message as any).message,
      error: typeof message === 'object' ? (message as any).error : undefined,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
