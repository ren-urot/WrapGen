// server/src/storage.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

function getClient() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

function getPublicUrl() {
  return (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
}

function getBucket() {
  return process.env.R2_BUCKET || 'wrapgen';
}

export async function uploadBuffer(buffer, contentType, ext) {
  const key = `${crypto.randomUUID()}.${ext}`;
  const client = getClient();
  await client.send(new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return `${getPublicUrl()}/${key}`;
}
