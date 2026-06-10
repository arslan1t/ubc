import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

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
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = config.getOrThrow<string>('R2_BUCKET');
    this.publicUrl = config.getOrThrow<string>('R2_PUBLIC_URL');

    this.client = new S3Client({
      region: 'auto',
      endpoint: config.getOrThrow<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: config.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: config.getOrThrow<string>('R2_SECRET_ACCESS_KEY'),
      },
    });
  }

  async uploadImage(
    buffer: Buffer,
    folder: string,
    mimeType: string = 'image/jpeg',
  ): Promise<UploadResult> {
    const id = uuidv4();

    const [original, medium, thumbnail] = await Promise.all([
      sharp(buffer).jpeg({ quality: 85 }).toBuffer(),
      sharp(buffer).resize(800, 600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer(),
      sharp(buffer).resize(400, 300, { fit: 'cover' }).jpeg({ quality: 75 }).toBuffer(),
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

  async uploadAvatar(buffer: Buffer): Promise<{ key: string; url: string }> {
    const id = uuidv4();
    const processed = await sharp(buffer)
      .resize(256, 256, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    const key = `avatars/${id}.jpg`;
    await this.upload(key, processed, 'image/jpeg');
    return { key, url: this.getUrl(key) };
  }

  async deleteFile(key: string): Promise<void> {
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
    await this.client.send(
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
