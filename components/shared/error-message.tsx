import { AlertCircle } from "lucide-react";

type ErrorMessageProps = {
  message: string;
  className?: string;
};

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive ${className ?? ""}`}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
