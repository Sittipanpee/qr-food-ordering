import crypto from 'crypto';

/**
 * Secret for HMAC hash generation
 * In production, use a secure environment variable
 */
const QUEUE_SECRET = process.env.QUEUE_SECRET || 'queue-secret-key-change-in-production';

/**
 * Generate queue number string (Q001, Q002, etc.)
 */
export function formatQueueNumber(number: number, prefix: string = 'Q'): string {
  return `${prefix}${String(number).padStart(3, '0')}`;
}

/**
 * Parse queue number string to get the number
 * @example parseQueueNumber('Q001') => 1
 */
export function parseQueueNumber(queueStr: string): number | null {
  const match = queueStr.match(/^[A-Z]+(\d+)$/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * Generate HMAC-SHA256 hash for queue URL
 * Returns first 8 characters of the hash
 */
export function generateQueueHash(orderId: string): string {
  const hmac = crypto.createHmac('sha256', QUEUE_SECRET);
  hmac.update(orderId);
  const hash = hmac.digest('hex');
  return hash.substring(0, 8);
}

/**
 * Verify queue hash is valid for the given order ID
 */
export function verifyQueueHash(orderId: string, hash: string): boolean {
  const expectedHash = generateQueueHash(orderId);
  return expectedHash === hash;
}

/**
 * Generate persistent queue URL
 * Format: /queue/{queueNumber}-{hash}
 */
export function generateQueueUrl(
  queueNumber: number,
  orderId: string,
  baseUrl?: string
): {
  path: string;
  url: string;
  hash: string;
} {
  const queueStr = formatQueueNumber(queueNumber);
  const hash = generateQueueHash(orderId);
  const path = `/queue/${queueStr}-${hash}`;
  const url = baseUrl ? `${baseUrl}${path}` : path;

  return {
    path,
    url,
    hash,
  };
}

/**
 * Parse queue URL to extract queue number and hash
 * @example parseQueueUrl('Q001-abc12345') => { queueNumber: 1, hash: 'abc12345' }
 */
export function parseQueueUrl(urlPart: string): {
  queueNumber: number;
  queueStr: string;
  hash: string;
} | null {
  const match = urlPart.match(/^([A-Z]+\d+)-([a-f0-9]{8})$/);
  if (!match) return null;

  const queueStr = match[1];
  const hash = match[2];
  const queueNumber = parseQueueNumber(queueStr);

  if (queueNumber === null) return null;

  return {
    queueNumber,
    queueStr,
    hash,
  };
}

/**
 * Validate queue URL format and hash
 */
export async function validateQueueUrl(
  urlPart: string,
  orderId: string
): Promise<{ valid: boolean; error?: string }> {
  const parsed = parseQueueUrl(urlPart);

  if (!parsed) {
    return { valid: false, error: 'Invalid queue URL format' };
  }

  const isValidHash = verifyQueueHash(orderId, parsed.hash);

  if (!isValidHash) {
    return { valid: false, error: 'Invalid queue URL hash' };
  }

  return { valid: true };
}
