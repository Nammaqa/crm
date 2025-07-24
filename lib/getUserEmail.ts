import jwt from 'jsonwebtoken';

interface DecodedToken {
  userName: string;
  role: string;
  wbEmailId?: string;
}

export function getUserEmail(token: string): string | null {
  try {
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decoded.wbEmailId || null;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}
