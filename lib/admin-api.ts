import { cookies } from "next/headers";
import { adminCookieName, getAdminSessionValue } from "./admin-auth";

export async function isAdminRequestAuthorized(request: Request) {
  const sessionValue = getAdminSessionValue();
  if (!sessionValue) return false;

  const cookieStore = await cookies();
  const cookie = cookieStore.get(adminCookieName)?.value;

  return cookie === sessionValue || request.headers.get("x-admin-token") === process.env.ADMIN_ACCESS_TOKEN;
}
