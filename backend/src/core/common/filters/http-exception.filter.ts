import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR, message = 'Internal error', errors: any;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const r = exception.getResponse() as any;
      message = r.message || exception.message;
      if (Array.isArray(r.message)) { errors = r.message.map((m: string) => ({ message: m })); message = 'Validation failed'; }
    } else if (exception instanceof Error) { this.logger.error(exception.message, exception.stack); }
    res.status(status).json({ statusCode: status, message, errors, path: req.url, timestamp: new Date().toISOString() });
  }
}
