import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your NomiTips account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
