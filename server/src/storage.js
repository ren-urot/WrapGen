// server/src/storage.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let _clientOverride = null;

// Used in tests to inject a mock client
function _setClientForTesting(client) {
  _clientOverride = client;
}

function getClient() {
  if (_clientOverride) return _clientOverride;
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

function isR2Configured() {
  const endpoint = process.env.R2_ENDPOINT || '';
  const keyId = process.env.R2_ACCESS_KEY_ID || '';
  return endpoint.startsWith('https://') && keyId.length > 0 && !keyId.includes(' ');
}

function getLocalUploadsDir() {
  return path.join(__dirname, '../../data/uploads');
}

function getServerBaseUrl() {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return `http://localhost:${process.env.PORT || 3001}`;
}

async function uploadBuffer(buffer, contentType, ext) {
  const key = `${crypto.randomUUID()}.${ext}`;

  if (isR2Configured()) {
    const client = getClient();
    await client.send(new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    return `${getPublicUrl()}/${key}`;
  }

  // Demo fallback: save locally and serve via /uploads
  const dir = getLocalUploadsDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, key), buffer);
  return `${getServerBaseUrl()}/uploads/${key}`;
}

module.exports = { uploadBuffer, _setClientForTesting };
