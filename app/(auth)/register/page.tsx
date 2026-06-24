import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your NOMICA account and start your fitness transformation journey today.",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
