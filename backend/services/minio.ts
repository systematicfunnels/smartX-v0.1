import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const minioClient = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  forcePathStyle: true,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
  }
});

export async function uploadFile(fileName: string, fileData: Buffer, contentType: string): Promise<string> {
  const bucket = process.env.MINIO_BUCKET || 'smartx-files';

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileName,
    Body: fileData,
    ContentType: contentType
  });

  await minioClient.send(command);
  return fileName;
}

export async function getFileUrl(fileName: string): Promise<string> {
  const bucket = process.env.MINIO_BUCKET || 'smartx-files';

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileName
  });

  return getSignedUrl(minioClient, command, { expiresIn: 3600 });
}

export async function deleteFile(fileName: string): Promise<void> {
  const bucket = process.env.MINIO_BUCKET || 'smartx-files';

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: fileName
  });

  await minioClient.send(command);
}

export async function fileExists(fileName: string): Promise<boolean> {
  try {
    const url = await getFileUrl(fileName);
    return true;
  } catch (error) {
    return false;
  }
}
