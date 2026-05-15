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
    const responseText = await response.text();
    let payload: Record<string, unknown> = {};
    try {
      payload = responseText ? (JSON.parse(responseText) as Record<string, unknown>) : {};
    } catch {
      payload = { error_description: responseText };
    }

    if (!response.ok) {
      const message =
        text(payload.error_description) ||
        text(payload.msg) ||
        text(payload.error) ||
        "Connexion refusee.";
      return NextResponse.json(
        { error: message },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();
    const secure = process.env.NODE_ENV === "production";
    const accessToken = text(payload.access_token);
    const refreshToken = text(payload.refresh_token);
    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Session Supabase incomplete apres connexion." },
        { status: 502 },
      );
    }

    const maxAge = Number(payload.expires_in ?? 3600);

    cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      maxAge,
      path: "/",
      sameSite: "lax",
      secure,
    });
    cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure,
    });

    const user = payload.user as { email?: unknown; id?: unknown } | undefined;

    return NextResponse.json({
      email: user?.email,
      id: user?.id,
    });
  } catch (error) {
    console.error("ContratPro login failed", error);
    return NextResponse.json(
      { error: "Supabase Auth est indisponible ou mal configure." },
      { status: 502 },
    );
  }
}
