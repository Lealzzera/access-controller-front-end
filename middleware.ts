import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import verifyToken from "./app/helpers/verifyToken";

export async function middleware(req: NextRequest) {
  const { cookies } = req;
  const accessToken = cookies.get("access_token")?.value;
  const isTokenValid = await verifyToken(accessToken);
  if (!isTokenValid && req.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isTokenValid && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/home", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
