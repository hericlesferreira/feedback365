import crypto from "node:crypto";

export const adminCookieName = "feedback365_admin";

export function getAdminSessionValue() {
  const token = process.env.ADMIN_ACCESS_TOKEN;

  if (!token) {
    return null;
  }

  return crypto.createHash("sha256").update(token).digest("hex");
}

export function isValidAdminToken(token: string) {
  const expected = process.env.ADMIN_ACCESS_TOKEN;

  if (!expected) {
    return false;
  }

  if (Buffer.byteLength(token) !== Buffer.byteLength(expected)) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
