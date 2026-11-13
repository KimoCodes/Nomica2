import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Admin & Coach Login",
  description: "Sign in to the NomiTips administrator or coach dashboard.",
};

export default function StaffLoginPage() {
  return (
    <Suspense>
      <LoginForm staffLogin />
    </Suspense>
  );
}
