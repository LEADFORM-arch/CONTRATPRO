import { cookies } from "next/headers";

import { getCurrentOrganizationId, isAuthEnforced } from "@/server/tenant";

export const ACCESS_TOKEN_COOKIE = "contratpro-access-token";
export const REFRESH_TOKEN_COOKIE = "contratpro-refresh-token";

type SupabaseAuthUser = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

type SupabaseAuthConfig = {
  anonKey: string;
  baseUrl: string;
  serviceRoleKey?: string;
};

export class AuthRequiredError extends Error {
  constructor(message = "Authentification requise.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

function getSupabaseAuthConfig(): SupabaseAuthConfig | null {
  const baseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!baseUrl || !anonKey) {
    return null;
  }

  return {
    anonKey,
    baseUrl,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

export function getPublicSupabaseAuthConfig() {
  const config = getSupabaseAuthConfig();
  if (!config) {
    throw new AuthRequiredError(
      "Supabase Auth n'est pas configure. Ajoutez SUPABASE_URL et SUPABASE_ANON_KEY.",
    );
  }
  return config;
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getCurrentUser() {
  const config = getSupabaseAuthConfig();
  const accessToken = await getAccessToken();

  if (!config || !accessToken) {
    return null;
  }

  const response = await fetch(`${config.baseUrl}/auth/v1/user`, {
    cache: "no-store",
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as SupabaseAuthUser;
}

async function getOrganizationIdFromMembership(userId: string) {
  const config = getSupabaseAuthConfig();
  if (!config) {
    return null;
  }

  const key = config.serviceRoleKey || config.anonKey;
  const response = await fetch(
    `${config.baseUrl}/rest/v1/organization_memberships?user_id=eq.${encodeURIComponent(
      userId,
    )}&select=organization_id&limit=1`,
    {
      cache: "no-store",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const rows = (await response.json()) as Array<{ organization_id: string }>;
  return rows[0]?.organization_id ?? null;
}

function getOrganizationIdFromClaims(user: SupabaseAuthUser) {
  const claim =
    user.app_metadata?.org_id ||
    user.app_metadata?.organization_id ||
    user.user_metadata?.org_id ||
    user.user_metadata?.organization_id;

  return typeof claim === "string" && claim.trim() ? claim.trim() : null;
}

export async function getAuthenticatedOrganizationId() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthRequiredError();
  }

  const fromMembership = await getOrganizationIdFromMembership(user.id);
  const fromClaims = getOrganizationIdFromClaims(user);
  const organizationId = fromMembership || fromClaims;

  if (!organizationId) {
    throw new AuthRequiredError(
      "Aucune entreprise n'est rattachee a cet utilisateur.",
    );
  }

  return organizationId;
}

export async function getRequestOrganizationId() {
  if (!isAuthEnforced()) {
    return getCurrentOrganizationId();
  }

  return getAuthenticatedOrganizationId();
}

export async function getSupabaseReadHeaders() {
  const config = getSupabaseAuthConfig();
  if (!config) {
    return null;
  }

  if (isAuthEnforced()) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new AuthRequiredError();
    }
    return {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  const key = config.serviceRoleKey || config.anonKey;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

export async function getSupabaseWriteHeaders() {
  const config = getSupabaseAuthConfig();
  if (!config) {
    return null;
  }

  if (isAuthEnforced()) {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new AuthRequiredError();
    }
    return {
      apikey: config.anonKey,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  const key = config.serviceRoleKey || config.anonKey;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}
