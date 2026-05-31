'use server';

import { jwtVerify } from 'jose';

export default async function verifyToken(accessToken?: string) {
  if (!accessToken) {
    return false;
  }
  try {
    const jwtSecret = process.env.JWT_SECRET ?? process.env.JWT_ACCESS_TOKEN_SECRET;

    if (!jwtSecret) {
      return false;
    }

    await jwtVerify(accessToken, new TextEncoder().encode(jwtSecret));

    return true;
  } catch (error) {
    return false;
  }
}
