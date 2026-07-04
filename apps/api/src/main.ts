import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import multipart from '@fastify/multipart';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: process.env.NODE_ENV !== 'production',
      // Behind Render's proxy: without this every client shares the proxy IP
      // and per-IP rate limiting throttles all users together.
      trustProxy: true,
    }),
  );

  await app.register(helmet, {
    // JSON-only API — CSP is for HTML pages and would only add noise here.
    contentSecurityPolicy: false,
  });

  // Image uploads (courts / news galleries) — 25MB cap covers modern phone
  // photos (a 12MP HEIC/JPEG is often 10-15MB); Sharp shrinks them afterwards.
  await app.register(multipart, {
    limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  });

  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (curl, mobile, etc.)
      if (!origin) return callback(null, true);
      // Allow localhost in dev + configured frontend URL + any vercel.app
      // subdomain + the production domain (with and without www).
      const allowed =
        origin === frontendUrl ||
        origin === 'https://ubculture.uz' ||
        origin === 'https://www.ubculture.uz' ||
        origin.startsWith('http://localhost') ||
        origin.endsWith('.vercel.app');
      callback(null, allowed);
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Health check endpoint for Render / Railway
  app.getHttpAdapter().get('/api/v1/health', (_req: any, reply: any) => {
    reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('UBC API')
      .setDescription('Uzbek Basketball Culture API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port, '0.0.0.0');
  console.log(`UBC API running on port ${port}`);
}

bootstrap();
