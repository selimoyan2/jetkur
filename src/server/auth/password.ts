import crypto from "crypto";

const SCRYPT_KEYLEN = 64;
const SALT_BYTES = 16;

/**
 * Hashes a plaintext password using Node.js crypto.scrypt with a unique random salt
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Verifies a password against a stored scrypt hash using timingSafeEqual
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!storedHash || !storedHash.startsWith("scrypt$")) {
      return resolve(false);
    }

    const parts = storedHash.split("$");
    if (parts.length !== 3) {
      return resolve(false);
    }

    const [, salt, hash] = parts;
    const hashBuffer = Buffer.from(hash, "hex");

    crypto.scrypt(password, salt, hashBuffer.length, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const matches = crypto.timingSafeEqual(hashBuffer, derivedKey);
        resolve(matches);
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Validates password strength (minimum 8 characters)
 */
export function validatePasswordStrength(password: string): { valid: boolean; reason?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, reason: "Şifre zorunludur." };
  }
  if (password.length < 8) {
    return { valid: false, reason: "Şifre en az 8 karakter uzunluğunda olmalıdır." };
  }
  return { valid: true };
}
