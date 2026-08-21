import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create your NOMICA account and start training with expert coaching.",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
