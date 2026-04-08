// server/src/storage.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

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

async function uploadBuffer(buffer, contentType, ext) {
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

module.exports = { uploadBuffer, _setClientForTesting };
