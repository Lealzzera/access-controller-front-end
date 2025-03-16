"user server";

import { jwtVerify } from "jose";

export default async function verifyToken(accessToken?: string) {
  if (!accessToken) {
    return false;
  }
  try {
    console.log(process.env.JWT_ACCESS_TOKEN_SECRET);
    await jwtVerify(
      accessToken,
      new TextEncoder().encode(process.env.JWT_ACCESS_TOKEN_SECRET)
    );
    return true;
  } catch (error) {
    return false;
  }
}
