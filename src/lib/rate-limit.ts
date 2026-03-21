const windowMs = 60 * 1000; // 1 minute

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

export function checkRateLimit(
  ip: string,
  hasApiKey: boolean
): { allowed: boolean; remaining: number; limit: number; resetAt: number } {
  const limit = hasApiKey ? 200 : 30;
  const now = Date.now();
  const key = `${ip}:${hasApiKey ? 'keyed' : 'anon'}`;

  let entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count++;

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    limit,
    resetAt: entry.resetAt,
  };
}

export function validateApiKey(key: string | null): boolean {
  if (!key) return false;
  const keys = process.env.MERMAID_API_KEYS?.split(',').map((k) => k.trim()) || [];
  return keys.length > 0 && keys.includes(key);
}
