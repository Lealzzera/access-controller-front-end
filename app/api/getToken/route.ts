import { cookies } from "next/headers";

export async function GET() {
  try {
    const userCookie = await cookies();
    const tokenUser = userCookie.get("access_token");
    return Response.json(tokenUser);
  } catch (err) {
    console.error(err);
  }
}
