import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters for adequate entropy"),
  AUTH_URL: z.string().url("AUTH_URL must be a valid URL"),

  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  STRIPE_PRICE_MONTHLY: z.string().min(1, "STRIPE_PRICE_MONTHLY is required"),
  STRIPE_PRICE_ANNUAL: z.string().min(1, "STRIPE_PRICE_ANNUAL is required"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  HOSTNAME: z.string().optional(),
  PORT: z.string().optional(),

  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  SENTRY_DSN: z.string().url().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required"),
});

function validateEnv() {
  const serverResult = serverSchema.safeParse(process.env);
  const clientResult = clientSchema.safeParse(process.env);

  const errors: string[] = [];

  if (!serverResult.success) {
    for (const issue of serverResult.error.issues) {
      errors.push(`[Server] ${issue.path.join(".")}: ${issue.message}`);
    }
  }

  if (!clientResult.success) {
    for (const issue of clientResult.error.issues) {
      errors.push(`[Client] ${issue.path.join(".")}: ${issue.message}`);
    }
  }

  if (errors.length > 0) {
    console.error("\n❌ Environment validation failed:\n");
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    console.error("\nRefer to .env.example for required variables.\n");
    process.exit(1);
  }

  return {
    server: {
      ...serverResult.data!,
      NODE_ENV: serverResult.data!.NODE_ENV ?? "development",
    },
    client: clientResult.data!,
  };
}

export const env = validateEnv();
