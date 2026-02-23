import bcrypt from 'bcrypt';
import { generateSessionToken, verifySessionToken } from './jwt';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Re-export JWT functions from jwt.ts for backward compatibility
export { generateSessionToken, verifySessionToken } from './jwt';

/**
 * Check if admin password is correct
 * In production, this should check against env variable ADMIN_PASSWORD_HASH
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminPasswordHash) {
    // For development: accept any password if hash not set
    console.warn('ADMIN_PASSWORD_HASH not set in environment variables');
    return password === 'admin123'; // Default dev password
  }

  return verifyPassword(password, adminPasswordHash);
}
