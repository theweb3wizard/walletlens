import { neon, NeonQueryFunction } from "@neondatabase/serverless";

// Lazy client — only instantiated on first use so the build succeeds
// even without DATABASE_URL set locally.
let _sql: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it to .env.local (local dev) or Vercel environment variables (production)."
      );
    }
    _sql = neon(url);
  }
  return _sql;
}

// Proxy so callers can still do: sql`SELECT ...`
export const sql: NeonQueryFunction<false, false> = new Proxy(
  {} as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args) {
      return (getClient() as unknown as (...a: unknown[]) => unknown)(...args);
    },
    get(_target, prop) {
      const client = getClient();
      const val = (client as unknown as Record<string | symbol, unknown>)[prop];
      return typeof val === "function" ? val.bind(client) : val;
    },
  }
);
