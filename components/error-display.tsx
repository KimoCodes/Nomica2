"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorBoundaryProps = {
  error: Error;
  reset: () => void;
  title?: string;
  description?: string;
};

export function ErrorDisplay({ error, reset, title = "Something went wrong", description }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {description ?? "An unexpected error occurred. Please try again."}
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="rounded bg-muted p-2">
            <code className="text-xs text-red-600">{error.message}</code>
          </div>
        )}
        <Button onClick={reset} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

export function NotFoundDisplay({ title = "Not found", description }: { title?: string; description?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {description ?? "The item you're looking for doesn't exist or has been removed."}
        </p>
      </CardContent>
    </Card>
  );
}

export function EmptyStateDisplay({ title, description, icon: Icon, action }: {
  title: string;
  description: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {Icon && <Icon className="h-12 w-12 text-muted-foreground" />}
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}
