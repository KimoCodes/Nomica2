import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  enabled:
    process.env.NODE_ENV === "production" &&
    !!process.env.SENTRY_DSN,

  tracesSampleRate: 0.1,

  beforeSend(event) {
    if (event.request?.headers) {
      const authCookie = event.request.headers["cookie"];
      if (authCookie) {
        event.request.headers["cookie"] = "[Filtered]";
      }
    }
    return event;
  },
});
