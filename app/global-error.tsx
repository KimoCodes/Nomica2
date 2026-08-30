"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1.5rem",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#666", marginBottom: "1.5rem", maxWidth: "28rem" }}>
            An unexpected error occurred. Please try again or return to the homepage.
          </p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => unstable_retry()}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid #ccc",
                background: "#fff",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid #ccc",
                background: "#fff",
                textDecoration: "none",
                color: "#333",
                fontSize: "0.875rem",
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
