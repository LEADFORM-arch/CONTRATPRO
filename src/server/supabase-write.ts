import {
  getRequestOrganizationId,
  getSupabaseWriteHeaders,
} from "@/server/auth";

type SupabaseWriteConfig = {
  baseUrl: string;
  key: string;
};

export class SupabaseWriteError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "SupabaseWriteError";
    this.status = status;
  }
}

function getSupabaseWriteConfig(): SupabaseWriteConfig {
  const baseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!baseUrl || !key) {
    throw new SupabaseWriteError(
      "Supabase n'est pas configure. Ajoutez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local.",
      503,
    );
  }

  return { baseUrl, key };
}

export function getOrganizationId() {
  throw new Error("Use getResolvedOrganizationId() in async server code.");
}

export async function getResolvedOrganizationId() {
  return getRequestOrganizationId();
}

async function writeHeaders() {
  const headers = await getSupabaseWriteHeaders();
  if (!headers) {
    throw new SupabaseWriteError(
      "Supabase n'est pas configure. Ajoutez SUPABASE_URL et SUPABASE_ANON_KEY dans .env.local.",
      503,
    );
  }
  return headers;
}

export async function insertSupabaseRow<T>(
  table: string,
  payload: Record<string, unknown>,
) {
  const { baseUrl } = getSupabaseWriteConfig();
  const authHeaders = await writeHeaders();
  const response = await fetch(`${baseUrl}/rest/v1/${table}`, {
    method: "POST",
    signal: AbortSignal.timeout(12000),
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new SupabaseWriteError(
      message || `Supabase a refuse l'insertion dans ${table}.`,
      response.status,
    );
  }

  const rows = (await response.json()) as T[];
  return rows[0];
}

export async function selectSupabaseRows<T>(table: string, query: string) {
  const { baseUrl } = getSupabaseWriteConfig();
  const authHeaders = await writeHeaders();
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${query}`, {
    method: "GET",
    signal: AbortSignal.timeout(12000),
    headers: {
      ...authHeaders,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new SupabaseWriteError(
      message || `Supabase a refuse la lecture dans ${table}.`,
      response.status,
    );
  }

  return (await response.json()) as T[];
}

export async function updateSupabaseRows<T>(
  table: string,
  filter: string,
  payload: Record<string, unknown>,
) {
  const { baseUrl } = getSupabaseWriteConfig();
  const authHeaders = await writeHeaders();
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    signal: AbortSignal.timeout(12000),
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new SupabaseWriteError(
      message || `Supabase a refuse la mise a jour dans ${table}.`,
      response.status,
    );
  }

  return (await response.json()) as T[];
}
