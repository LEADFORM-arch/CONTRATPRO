type SupabaseServiceConfig = {
  baseUrl: string;
  key: string;
};

export class SupabaseServiceError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "SupabaseServiceError";
    this.status = status;
  }
}

function config(): SupabaseServiceConfig {
  const baseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!baseUrl || !key) {
    throw new SupabaseServiceError(
      "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis pour traiter les webhooks.",
      503,
    );
  }

  return { baseUrl, key };
}

function headers() {
  const { key } = config();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

export async function serviceSelect<T>(table: string, query: string) {
  const { baseUrl } = config();
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${query}`, {
    cache: "no-store",
    headers: headers(),
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new SupabaseServiceError(await response.text(), response.status);
  }

  return (await response.json()) as T[];
}

export async function serviceInsert<T>(
  table: string,
  payload: Record<string, unknown>,
) {
  const { baseUrl } = config();
  const response = await fetch(`${baseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...headers(),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new SupabaseServiceError(await response.text(), response.status);
  }

  const rows = (await response.json()) as T[];
  return rows[0];
}

export async function serviceUpdate<T>(
  table: string,
  filter: string,
  payload: Record<string, unknown>,
) {
  const { baseUrl } = config();
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    headers: {
      ...headers(),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new SupabaseServiceError(await response.text(), response.status);
  }

  return (await response.json()) as T[];
}
