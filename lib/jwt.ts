
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { User } from '@prisma/client';

type TokenPayload = {
  id: number;
  userName: string;
  role: string;
};

// Helper to get the secret as Uint8Array
function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET || 'NishanthKJ');
}

// Sign JWT token using jose
export async function signJwtToken(user: User): Promise<string> {
  const payload: TokenPayload = {
    id: user.id,
    userName: user.userName,
    role: user.role,
  };

  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '30m';

  // jose expects expiration as a timestamp, so we calculate it
  const now = Math.floor(Date.now() / 1000);
  let exp: number;
  if (typeof expiresIn === 'string' && expiresIn.endsWith('m')) {
    exp = now + parseInt(expiresIn) * 60;
  } else if (typeof expiresIn === 'string' && expiresIn.endsWith('h')) {
    exp = now + parseInt(expiresIn) * 60 * 60;
  } else if (!isNaN(Number(expiresIn))) {
    exp = now + Number(expiresIn);
  } else {
    exp = now + 30 * 60; // default 30 minutes
  }

  return await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(exp)
    .setIssuedAt()
    .sign(secret);
}

// Verify JWT token using jose
export async function verifyJwtToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    // Optionally, validate payload shape here
    return payload as TokenPayload;
  } catch (error) {
    console.error('Invalid or expired token:', error);
    return null;
  }
}

// Sanitize user object to remove sensitive fields like password
export function sanitizeUser(user: User) {
  // Omit 'password' without assigning it to a variable to avoid ESLint warning
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
