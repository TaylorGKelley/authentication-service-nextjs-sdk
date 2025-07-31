import jwt from 'jsonwebtoken';

export function isExpiredToken(token: string) {
  const { exp } = jwt.decode(token) as { exp: number };

  const expirationTime = exp * 1000; // Convert to Milliseconds and Date

  return expirationTime < Date.now();
}
