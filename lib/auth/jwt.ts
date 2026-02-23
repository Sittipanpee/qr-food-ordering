import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);
const JWT_ALGORITHM = 'HS256';

/**
 * Generate a session token (JWT)
 * Edge Runtime compatible (uses jose only, no bcrypt)
 */
export async function generateSessionToken(payload: {
  userId: string;
  role: string;
}): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('7d') // Token expires in 7 days
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a session token
 * Edge Runtime compatible (uses jose only, no bcrypt)
 */
export async function verifySessionToken(token: string): Promise<{
  userId: string;
  role: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      role: payload.role as string,
    };
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}
