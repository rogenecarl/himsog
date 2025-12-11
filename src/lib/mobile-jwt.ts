import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// JWT secret - use the same secret as Better Auth for consistency
const JWT_SECRET = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || "fallback-secret-min-32-characters-long"
);

// Token expiration: 30 days for mobile apps (longer than web sessions)
const TOKEN_EXPIRATION = "30d";

export interface MobileJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token for mobile authentication
 */
export async function generateMobileToken(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .setSubject(payload.userId)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a mobile JWT token
 */
export async function verifyMobileToken(
  token: string
): Promise<MobileJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as MobileJWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(
  authorizationHeader: string | null
): string | null {
  if (!authorizationHeader) return null;

  const parts = authorizationHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}
