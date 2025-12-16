import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { backendConfig } from '../../config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';

export class StorageService {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      endpoint: `http://${backendConfig.minio.endpoint}`,
      region: 'us-east-1',
      credentials: {
        accessKeyId: backendConfig.minio.accessKey,
        secretAccessKey: backendConfig.minio.secretKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(
    key: string,
    file: Buffer | Blob | string,
    contentType: string,
    options: { publicRead?: boolean } = {}
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: backendConfig.minio.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: options.publicRead ? 'public-read' : 'private',
    });

    await this.client.send(command);
    return key;
  }

  async uploadLargeFile(
    key: string,
    file: Buffer | Blob,
    contentType: string,
    options: { publicRead?: boolean } = {}
  ): Promise<string> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: backendConfig.minio.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: options.publicRead ? 'public-read' : 'private',
      },
    });

    await upload.done();
    return key;
  }

  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: backendConfig.minio.bucketName,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: backendConfig.minio.bucketName,
      Key: key,
    });

    const response = await this.client.send(command);
    return Buffer.from(await response.Body?.transformToByteArray() || []);
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: backendConfig.minio.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }

  async listFiles(prefix: string = ''): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: backendConfig.minio.bucketName,
      Prefix: prefix,
    });

    const response = await this.client.send(command);
    return response.Contents?.map((item: any) => item.Key || '') || [];
  }
}

// Singleton instance
export const storageService = new StorageService();
