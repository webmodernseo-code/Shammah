import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:v1:";

/**
 * Derives a consistent 256-bit key from the environment secret.
 */
function getDerivedKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ENCRYPTION_KEY must be configured with at least 32 characters.");
  }
  return createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a sensitive string using AES-256-GCM.
 * Safe against double-encryption: returns existing ciphertext if already encrypted.
 */
export function encryptSecret(plainText: string | null | undefined): string | null {
  if (!plainText) return null;
  const trimmed = plainText.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith(PREFIX)) return trimmed;

  try {
    const key = getDerivedKey();
    const iv = randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(trimmed, "utf8")),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
  } catch {
    throw new Error("Secret encryption failed.");
  }
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * Gracefully handles legacy unencrypted values for seamless migration.
 */
export function decryptSecret(cipherText: string | null | undefined): string {
  if (!cipherText) return "";
  const trimmed = cipherText.trim();
  if (!trimmed.startsWith(PREFIX)) {
    // Unencrypted legacy value: return as-is
    return trimmed;
  }

  try {
    const withoutPrefix = trimmed.slice(PREFIX.length);
    const parts = withoutPrefix.split(":");
    if (parts.length !== 3) return trimmed;

    const [ivHex, tagHex, dataHex] = parts;
    if (!ivHex || !tagHex || !dataHex) return trimmed;

    const key = getDerivedKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const data = Buffer.from(dataHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch {
    throw new Error("Secret decryption failed. Check ENCRYPTION_KEY.");
  }
}

/**
 * Safe display mask: Never reveals real characters or fragments.
 */
export function maskSecret(value?: string | null): string {
  return value && value.trim().length > 0 ? "••••••••••••••••" : "";
}
