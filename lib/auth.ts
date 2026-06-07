import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "default_fallback_jwt_secret_value_123456";

/**
 * Hash a password using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored PBKDF2 hash
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  try {
    const [salt, hash] = storedValue.split(":");
    if (!salt || !hash) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return testHash === hash;
  } catch (e) {
    return false;
  }
}

/**
 * Sign a payload into a JWT token using HMAC-SHA256
 */
export function signToken(payload: Record<string, any>): string {
  // Add expiration (e.g., 2 hours from now)
  const exp = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
  const fullPayload = { ...payload, exp };
  
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${encodedPayload}`)
    .digest("base64url");
    
  return `${header}.${encodedPayload}.${signature}`;
}

/**
 * Verify a JWT token and return its payload, or null if invalid/expired
 */
export function verifyToken(token: string): Record<string, any> | null {
  try {
    const [header, encodedPayload, signature] = token.split(".");
    if (!header || !encodedPayload || !signature) return null;
    
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${encodedPayload}`)
      .digest("base64url");
      
    if (signature !== expectedSignature) return null;
    
    const payloadJson = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson);
    
    // Check expiration
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Token expired
    }
    
    return payload;
  } catch (err) {
    return null;
  }
}
