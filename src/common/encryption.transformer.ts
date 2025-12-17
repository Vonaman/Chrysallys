import { ValueTransformer } from 'typeorm';
import * as crypto from 'crypto';

function getKey(): Buffer {
  const keyBase64 = process.env.ENCRYPTION_KEY;
  if (!keyBase64) {
    throw new Error('ENCRYPTION_KEY environment variable is not set. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
  }
  const key = Buffer.from(keyBase64, 'base64');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must decode to 32 bytes (256 bits)');
  }
  return key;
}

export const encryptionTransformer: ValueTransformer = {
  to(plain?: string | null): string | null {
    if (plain === null || plain === undefined) return plain as null;
    const key = getKey();
    const iv = crypto.randomBytes(12); // 96-bit nonce for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // store as: iv (12) | tag (16) | ciphertext
    return Buffer.concat([iv, tag, ciphertext]).toString('base64');
  },
  from(dbValue?: string | null): string | null {
    if (dbValue === null || dbValue === undefined) return dbValue as null;
    const key = getKey();
    const data = Buffer.from(dbValue, 'base64');
    const iv = data.slice(0, 12);
    const tag = data.slice(12, 28);
    const ciphertext = data.slice(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  },
};

// Note: This transformer uses AES-256-GCM and requires that you set
// ENCRYPTION_KEY in your environment to a base64-encoded 32-byte key.
// Example to generate a key locally:
//   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
