import * as Sentry from "@sentry/nextjs";

export function traceDbQuery<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: "db.query",
    },
    async () => fn(),
  );
}

export function traceApiRoute<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: "http.server",
    },
    async () => fn(),
  );
}

export function traceService<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: "service",
    },
    async () => fn(),
  );
}
