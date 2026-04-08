// server/tests/storage.test.js
import { describe, it, expect, vi } from 'vitest';

process.env.R2_ENDPOINT = 'https://fake.r2.dev';
process.env.R2_ACCESS_KEY_ID = 'fake-key';
process.env.R2_SECRET_ACCESS_KEY = 'fake-secret';
process.env.R2_BUCKET = 'wrapgen-test';
process.env.R2_PUBLIC_URL = 'https://pub.r2.dev';

const mockSend = vi.fn().mockResolvedValue({});

vi.mock('@aws-sdk/client-s3', () => {
  function MockS3Client() {
    this.send = mockSend;
  }
  function MockPutObjectCommand(params) {
    return params;
  }
  return {
    S3Client: MockS3Client,
    PutObjectCommand: MockPutObjectCommand,
  };
});

const { uploadBuffer } = await import('../src/storage.js');

describe('uploadBuffer', () => {
  it('returns a public URL with correct extension', async () => {
    const buf = Buffer.from('fake image data');
    const url = await uploadBuffer(buf, 'image/jpeg', 'jpg');
    expect(url).toMatch(/^https:\/\/pub\.r2\.dev\/.+\.jpg$/);
  });

  it('generates a unique key per call', async () => {
    const buf = Buffer.from('data');
    const url1 = await uploadBuffer(buf, 'image/png', 'png');
    const url2 = await uploadBuffer(buf, 'image/png', 'png');
    expect(url1).not.toBe(url2);
  });
});
