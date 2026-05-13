import { NextResponse } from "next/server";

type RateLimitOptions = {
  limit: number;
  request: Request;
  scope: string;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function clientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

export function rateLimit(options: RateLimitOptions) {
  const now = Date.now();
  const key = `${options.scope}:${clientIp(options.request)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  current.count += 1;
  if (current.count <= options.limit) {
    return null;
  }

  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));

  return NextResponse.json(
    { error: "Trop de requetes. Reessayez dans quelques instants." },
    {
      headers: {
        "Retry-After": String(retryAfter),
      },
      status: 429,
    },
  );
}
