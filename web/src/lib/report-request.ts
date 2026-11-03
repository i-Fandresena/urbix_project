import "server-only";
import { createHash } from "node:crypto";
import { trustedOrigins } from "@/lib/auth-config";

const rateBuckets = new Map<string, { startedAt: number; count: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REPORTS_PER_WINDOW = 12;
const TRACKING_WINDOW_MS = 60 * 1000;
const MAX_TRACKING_REQUESTS_PER_WINDOW = 45;

export function hasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return trustedOrigins().includes(new URL(origin).origin);
  } catch {
    return false;
  }
}

export function consumeReportSubmission(request: Request) {
  return consumeFromWindow(request, "reports", WINDOW_MS, MAX_REPORTS_PER_WINDOW);
}

export function consumeTrackingRequest(request: Request) {
  return consumeFromWindow(request, "tracking", TRACKING_WINDOW_MS, MAX_TRACKING_REQUESTS_PER_WINDOW);
}

function consumeFromWindow(request: Request, scope: string, windowMs: number, limit: number) {
  const address = request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = createHash("sha256").update(`${scope}:${address}`).digest("hex");
  const now = Date.now();
  for (const [entryKey, bucket] of rateBuckets) if (now - bucket.startedAt > Math.max(WINDOW_MS, TRACKING_WINDOW_MS)) rateBuckets.delete(entryKey);
  const current = rateBuckets.get(key);
  if (!current || now - current.startedAt > windowMs) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}
