import { verifyEmail } from "@/actions/auth.actions";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
            <XCircle className="size-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Invalid verification link</h1>
        <p className="mt-2 text-muted-foreground">
          This verification link is missing or invalid.
        </p>
        <Link
          href="/login"
          className={buttonVariants({ className: "mt-6 group" })}
        >
          Go to login
        </Link>
      </div>
    );
  }

  const result = await verifyEmail(token);

  return (
    <div className="w-full max-w-sm text-center">
      <div className="mb-6 flex justify-center">
        <div
          className={`flex size-16 items-center justify-center rounded-2xl ${
            result.success ? "bg-success/10" : "bg-destructive/10"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="size-8 text-success" />
          ) : (
            <XCircle className="size-8 text-destructive" />
          )}
        </div>
      </div>
      <h1 className="text-2xl font-bold">
        {result.success ? "Email verified" : "Verification failed"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {result.success ? result.data?.message : result.error?.message}
      </p>
      <Link
        href="/login"
        className={buttonVariants({ className: "mt-6 group" })}
      >
        Continue to login
      </Link>
    </div>
  );
}
