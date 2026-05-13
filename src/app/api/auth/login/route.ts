import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  getPublicSupabaseAuthConfig,
  REFRESH_TOKEN_COOKIE,
} from "@/server/auth";
import { rateLimit } from "@/server/rate-limit";

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  try {
    const limited = rateLimit({
      limit: 8,
      request,
      scope: "auth-login",
      windowMs: 60_000,
    });
    if (limited) {
      return limited;
    }

    const body = (await request.json()) as Record<string, unknown>;
    const email = text(body.email);
    const password = text(body.password);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe sont obligatoires." },
        { status: 400 },
      );
    }

    const config = getPublicSupabaseAuthConfig();
    const response = await fetch(
      `${config.baseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: config.anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    );
    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: payload.error_description || "Connexion refusee." },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    const secure = process.env.NODE_ENV === "production";
    const maxAge = Number(payload.expires_in ?? 3600);

    cookieStore.set(ACCESS_TOKEN_COOKIE, payload.access_token, {
      httpOnly: true,
      maxAge,
      path: "/",
      sameSite: "lax",
      secure,
    });
    cookieStore.set(REFRESH_TOKEN_COOKIE, payload.refresh_token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure,
    });

    return NextResponse.json({
      email: payload.user?.email,
      id: payload.user?.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de connecter cet utilisateur." },
      { status: 500 },
    );
  }
}
