"use server";

import { jwtVerify } from "jose";

export default async function decodeToken(token: string) {
  const tokenDecoded = await jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_ACCESS_TOKEN_SECRET)
  );

  return tokenDecoded.payload;
}
