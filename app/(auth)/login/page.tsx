import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your NOMICA account to access your fitness programs, coach, and progress tracking.",
};

export default function LoginPage() {
  return <LoginForm />;
}
