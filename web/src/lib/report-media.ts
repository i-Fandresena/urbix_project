import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const encoded = process.env.LAVERTA_MEDIA_ENCRYPTION_KEY;
  if (!encoded) return null;
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("La clé de chiffrement des médias doit contenir 32 octets en base64.");
  return key;
}

export function isMediaEncryptionConfigured() {
  try {
    return Boolean(getEncryptionKey());
  } catch {
    return false;
  }
}

export function encryptReportMedia(bytes: Buffer) {
  const key = getEncryptionKey();
  if (!key) throw new Error("Le chiffrement des médias n’est pas configuré.");
  const nonce = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, nonce);
  const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
  return { ciphertext, nonce, tag: cipher.getAuthTag() };
}

export function decryptReportMedia(ciphertext: Buffer, nonce: Buffer, tag: Buffer) {
  const key = getEncryptionKey();
  if (!key) throw new Error("Le chiffrement des médias n’est pas configuré.");
  const decipher = createDecipheriv(ALGORITHM, key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
