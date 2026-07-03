import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminCookieName, getAdminSessionValue, isValidAdminToken } from "@/lib/admin-auth";

const loginSchema = z.object({
  token: z.string().min(1)
});

export async function POST(request: Request) {
  const body = loginSchema.parse(await request.json());

  if (!isValidAdminToken(body.token)) {
    return NextResponse.json({ message: "Chave administrativa invalida." }, { status: 401 });
  }

  const sessionValue = getAdminSessionValue();

  if (!sessionValue) {
    return NextResponse.json(
      { message: "ADMIN_ACCESS_TOKEN nao esta configurado." },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(adminCookieName, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return NextResponse.json({ ok: true });
}
