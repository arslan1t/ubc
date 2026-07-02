import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import heicConvert from 'heic-convert';
import { v4 as uuidv4 } from 'uuid';

/** HEIC/HEIF files start with an ftyp box whose brand names one of these. */
const HEIC_BRANDS = ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1'];

function isHeic(buffer: Buffer, mimeType?: string): boolean {
  if (mimeType && /hei[cf]/i.test(mimeType)) return true;
  if (buffer.length < 12) return false;
  const brand = buffer.toString('ascii', 8, 12).toLowerCase();
  return HEIC_BRANDS.includes(brand);
}

export interface UploadResult {
  key: string;
  url: string;
  thumbnailKey: string;
  thumbnailUrl: string;
  mediumKey: string;
  mediumUrl: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private readonly configured: boolean;

  constructor(private config: ConfigService) {
    this.bucket = config.get<string>('R2_BUCKET', '');
    this.publicUrl = config.get<string>('R2_PUBLIC_URL', '');
    const endpoint = config.get<string>('R2_ENDPOINT', '');
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID', '');
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY', '');

    // Storage is optional: the app boots without R2 configured.
    // Uploads will throw a clear error until R2 env vars are provided.
    this.configured = Boolean(
      this.bucket && this.publicUrl && endpoint && accessKeyId && secretAccessKey,
    );

    if (this.configured) {
      this.client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.client = null;
      this.logger.warn(
        'R2 storage is not configured (missing R2_* env vars). File uploads are disabled.',
      );
    }
  }

  private ensureConfigured(): S3Client {
    if (!this.configured || !this.client) {
      throw new ServiceUnavailableException(
        'File storage is not configured. Set R2_* environment variables to enable uploads.',
      );
    }
    return this.client;
  }

  async uploadImage(
    buffer: Buffer,
    folder: string,
    mimeType?: string,
  ): Promise<UploadResult> {
    const id = uuidv4();

    if (isHeic(buffer, mimeType)) {
      try {
        buffer = Buffer.from(
          await heicConvert({ buffer, format: 'JPEG', quality: 0.92 }),
        );
      } catch {
        throw new BadRequestException(
          'Не удалось обработать HEIC-фото. Попробуйте другой файл или конвертируйте его в JPEG.',
        );
      }
    }

    // rotate() with no args auto-orients from EXIF — otherwise phone photos
    // (especially HEIC) can land sideways. Cap the "original" at 1920px so a
    // 12+ MP phone photo doesn't ship a multi-megabyte file for web display.
    const [original, medium, thumbnail] = await Promise.all([
      sharp(buffer)
        .rotate()
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer(),
      sharp(buffer)
        .rotate()
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer(),
      sharp(buffer)
        .rotate()
        .resize(400, 300, { fit: 'cover' })
        .jpeg({ quality: 75, mozjpeg: true })
        .toBuffer(),
    ]);

    const originalKey = `${folder}/${id}/original.jpg`;
    const mediumKey = `${folder}/${id}/medium.jpg`;
    const thumbnailKey = `${folder}/${id}/thumbnail.jpg`;

    await Promise.all([
      this.upload(originalKey, original, 'image/jpeg'),
      this.upload(mediumKey, medium, 'image/jpeg'),
      this.upload(thumbnailKey, thumbnail, 'image/jpeg'),
    ]);

    return {
      key: originalKey,
      url: this.getUrl(originalKey),
      mediumKey,
      mediumUrl: this.getUrl(mediumKey),
      thumbnailKey,
      thumbnailUrl: this.getUrl(thumbnailKey),
    };
  }

  async uploadAvatar(buffer: Buffer, mimeType?: string): Promise<{ key: string; url: string }> {
    const id = uuidv4();

    if (isHeic(buffer, mimeType)) {
      try {
        buffer = Buffer.from(
          await heicConvert({ buffer, format: 'JPEG', quality: 0.92 }),
        );
      } catch {
        throw new BadRequestException(
          'Не удалось обработать HEIC-фото. Попробуйте другой файл или конвертируйте его в JPEG.',
        );
      }
    }

    const processed = await sharp(buffer)
      .rotate()
      .resize(256, 256, { fit: 'cover' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();

    const key = `avatars/${id}.jpg`;
    await this.upload(key, processed, 'image/jpeg');
    return { key, url: this.getUrl(key) };
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.configured || !this.client) return;
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (err) {
      this.logger.warn(`Failed to delete ${key}: ${err}`);
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    await Promise.allSettled(keys.map((k) => this.deleteFile(k)));
  }

  private async upload(key: string, body: Buffer, contentType: string) {
    const client = this.ensureConfigured();
    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
  }

  getUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}
