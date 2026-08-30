"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRPELabel, getRPEColor, type RPEValue } from "@/server/services/fitness-engine/adaptive-difficulty";

type RPEInputProps = {
  exerciseName: string;
  onRate?: (rpe: number) => void;
  disabled?: boolean;
};

export function RPEInput({ exerciseName, onRate, disabled = false }: RPEInputProps) {
  const [selectedRPE, setSelectedRPE] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (selectedRPE !== null) {
      onRate?.(selectedRPE);
      setSubmitted(true);
    }
  };

  const rpeValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">{exerciseName}</span>
            <Badge className={getRPEColor(selectedRPE as RPEValue)}>
              RPE {selectedRPE} - {getRPELabel(selectedRPE as RPEValue)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Rate: {exerciseName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {rpeValues.map((rpe) => (
            <Button
              key={rpe}
              variant={selectedRPE === rpe ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setSelectedRPE(rpe)}
              disabled={disabled}
              aria-label={`RPE ${rpe}: ${getRPELabel(rpe as RPEValue)}`}
            >
              {rpe}
            </Button>
          ))}
        </div>

        {selectedRPE !== null && (
          <div className="flex items-center justify-between">
            <Badge className={getRPEColor(selectedRPE as RPEValue)}>
              {getRPELabel(selectedRPE as RPEValue)}
            </Badge>
            <Button size="sm" onClick={handleSubmit} disabled={disabled}>
              Submit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
