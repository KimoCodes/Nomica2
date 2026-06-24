import { cn } from "@/lib/utils";

type StepIndicatorProps = {
  steps: readonly { step: number; title: string }[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <ol className="flex w-full gap-2">
      {steps.map(({ step, title }) => {
        const isComplete = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <li
            key={step}
            className={cn(
              "flex flex-1 flex-col gap-1",
              step < steps.length && "pr-2",
            )}
          >
            <div
              className={cn(
                "h-1 rounded-full transition-colors",
                isComplete || isCurrent ? "bg-primary" : "bg-muted",
              )}
            />
            <span
              className={cn(
                "hidden text-xs sm:block",
                isCurrent ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {title}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
