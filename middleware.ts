import { NextResponse, type NextRequest } from "next/server";

const adminCookieName = "feedback365_admin";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const token = process.env.ADMIN_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(adminCookieName)?.value;
  const expected = await sha256(token);

  if (cookie === expected) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"]
};
