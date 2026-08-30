"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Dumbbell, Utensils, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

type QuickAction = {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick: () => void;
};

type QuickActionFABProps = {
  actions?: QuickAction[];
  className?: string;
};

const defaultActions: QuickAction[] = [
  { id: "workout", label: "Log Workout", icon: Dumbbell, onClick: () => {} },
  { id: "meal", label: "Log Meal", icon: Utensils, onClick: () => {} },
  { id: "photo", label: "Progress Photo", icon: Camera, onClick: () => {} },
];

export function QuickActionFAB({ actions = defaultActions, className }: QuickActionFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("fixed bottom-24 right-4 z-40 md:hidden", className)}>
      {isOpen && (
        <div className="mb-4 space-y-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="secondary"
              size="lg"
              className="w-full justify-start gap-2 shadow-lg"
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
            >
              <action.icon className="h-5 w-5" />
              {action.label}
            </Button>
          ))}
        </div>
      )}

      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-transform",
          isOpen && "rotate-45"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
