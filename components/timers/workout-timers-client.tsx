"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Coffee,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type TimerType = "hiit" | "rest" | "countdown";

type TimerClientProps = {
  userName: string | null;
};

const HIIT_PRESETS = [
  { label: "Tabata", work: 20, rest: 10, rounds: 8 },
  { label: "EMOM", work: 50, rest: 10, rounds: 10 },
  { label: "30/30", work: 30, rest: 30, rounds: 10 },
  { label: "45/15", work: 45, rest: 15, rounds: 8 },
  { label: "60/30", work: 60, rest: 30, rounds: 6 },
];

export function TimerClient({ userName }: TimerClientProps) {
  const [activeTab, setActiveTab] = useState<TimerType>("hiit");

  return (
    <DashboardLayout
      title="Timers"
      navItems={[...CLIENT_NAV]}
      userName={userName ?? undefined}
      userRole="Client"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workout Timers</h2>
          <p className="mt-1 text-muted-foreground">
            HIIT timer, rest timer, and countdown for your sessions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {[
            { id: "hiit" as TimerType, label: "HIIT Timer", icon: Zap },
            { id: "rest" as TimerType, label: "Rest Timer", icon: Coffee },
            { id: "countdown" as TimerType, label: "Countdown", icon: Timer },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "hiit" && <HIITTimer />}
        {activeTab === "rest" && <RestTimer />}
        {activeTab === "countdown" && <CountdownTimer />}
      </div>
    </DashboardLayout>
  );
}

function HIITTimer() {
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(15);
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<"idle" | "work" | "rest" | "done">("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (phase === "work") {
            if (currentRound < rounds) {
              setPhase("rest");
              return restTime;
            } else {
              setPhase("done");
              setIsRunning(false);
              return 0;
            }
          } else if (phase === "rest") {
            setCurrentRound((r) => r + 1);
            setPhase("work");
            return workTime;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, phase, currentRound, rounds, workTime, restTime, clearTimer]);

  const start = () => {
    setCurrentRound(1);
    setPhase("work");
    setTimeLeft(workTime);
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);
  const resume = () => setIsRunning(true);

  const reset = () => {
    clearTimer();
    setIsRunning(false);
    setPhase("idle");
    setCurrentRound(0);
    setTimeLeft(0);
  };

  const applyPreset = (preset: (typeof HIIT_PRESETS)[number]) => {
    setWorkTime(preset.work);
    setRestTime(preset.rest);
    setRounds(preset.rounds);
    reset();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress =
    phase === "work"
      ? ((workTime - timeLeft) / workTime) * 100
      : phase === "rest"
        ? ((restTime - timeLeft) / restTime) * 100
        : 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Display */}
        <div className="mb-8 flex flex-col items-center">
          <div
            className={`relative mb-4 flex size-48 items-center justify-center rounded-full border-4 transition-colors ${
              phase === "work"
                ? "border-primary bg-primary/10"
                : phase === "rest"
                  ? "border-success bg-success/10"
                  : phase === "done"
                    ? "border-warning bg-warning/10"
                    : "border-border"
            }`}
          >
            <svg className="absolute inset-0 size-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-border"
              />
              <circle
                cx="96"
                cy="96"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={565.48}
                strokeDashoffset={565.48 - (565.48 * progress) / 100}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${
                  phase === "work"
                    ? "text-primary"
                    : phase === "rest"
                      ? "text-success"
                      : "text-border"
                }`}
              />
            </svg>
            <div className="text-center">
              <p className="text-4xl font-bold tabular-nums">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </p>
              <p
                className={`mt-1 text-sm font-medium uppercase tracking-wider ${
                  phase === "work"
                    ? "text-primary"
                    : phase === "rest"
                      ? "text-success"
                      : "text-muted-foreground"
                }`}
              >
                {phase === "idle"
                  ? "Ready"
                  : phase === "done"
                    ? "Complete!"
                    : phase}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Round {Math.min(currentRound, rounds)} of {rounds}
          </p>

          {/* Controls */}
          <div className="mt-4 flex gap-3">
            {phase === "idle" || phase === "done" ? (
              <Button onClick={start} size="lg" className="gap-2">
                <Play className="size-4" />
                Start
              </Button>
            ) : (
              <>
                <Button
                  onClick={isRunning ? pause : resume}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  {isRunning ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  {isRunning ? "Pause" : "Resume"}
                </Button>
                <Button onClick={reset} variant="outline" size="lg" className="gap-2">
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {HIIT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                disabled={isRunning}
                className="rounded-lg border border-border/50 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Work (sec)</Label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => !isRunning && setWorkTime(Math.max(5, workTime - 5))}
                disabled={isRunning}
                className="rounded-lg bg-muted p-1.5 hover:bg-muted/80 disabled:opacity-50"
              >
                <ChevronDown className="size-3" />
              </button>
              <Input
                type="number"
                value={workTime}
                onChange={(e) =>
                  !isRunning && setWorkTime(Math.max(5, parseInt(e.target.value) || 5))
                }
                disabled={isRunning}
                className="text-center"
              />
              <button
                onClick={() => !isRunning && setWorkTime(workTime + 5)}
                disabled={isRunning}
                className="rounded-lg bg-muted p-1.5 hover:bg-muted/80 disabled:opacity-50"
              >
                <ChevronUp className="size-3" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rest (sec)</Label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => !isRunning && setRestTime(Math.max(5, restTime - 5))}
                disabled={isRunning}
                className="rounded-lg bg-muted p-1.5 hover:bg-muted/80 disabled:opacity-50"
              >
                <ChevronDown className="size-3" />
              </button>
              <Input
                type="number"
                value={restTime}
                onChange={(e) =>
                  !isRunning && setRestTime(Math.max(5, parseInt(e.target.value) || 5))
                }
                disabled={isRunning}
                className="text-center"
              />
              <button
                onClick={() => !isRunning && setRestTime(restTime + 5)}
                disabled={isRunning}
                className="rounded-lg bg-muted p-1.5 hover:bg-muted/80 disabled:opacity-50"
              >
                <ChevronUp className="size-3" />
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Rounds</Label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => !isRunning && setRounds(Math.max(1, rounds - 1))}
                disabled={isRunning}
                className="rounded-lg bg-muted p-1.5 hover:bg-muted/80 disabled:opacity-50"
              >
                <ChevronDown className="size-3" />
              </button>
              <Input
                type="number"
                value={rounds}
                onChange={(e) =>
                  !isRunning && setRounds(Math.max(1, parseInt(e.target.value) || 1))
                }
                disabled={isRunning}
                className="text-center"
              />
              <button
                onClick={() => !isRunning && setRounds(rounds + 1)}
                disabled={isRunning}
                className="rounded-lg bg-muted p-1.5 hover:bg-muted/80 disabled:opacity-50"
              >
                <ChevronUp className="size-3" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RestTimer() {
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  const start = () => {
    setTimeLeft(duration);
    setIsRunning(true);
  };

  const reset = () => {
    clearTimer();
    setIsRunning(false);
    setTimeLeft(0);
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const presets = [15, 30, 45, 60, 90, 120];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-6 flex size-48 items-center justify-center rounded-full border-4 border-success/30 bg-success/5">
            <svg className="absolute inset-0 size-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-border"
              />
              <circle
                cx="96"
                cy="96"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={565.48}
                strokeDashoffset={565.48 - (565.48 * progress) / 100}
                strokeLinecap="round"
                className="text-success transition-all duration-1000"
              />
            </svg>
            <div className="text-center">
              <p className="text-4xl font-bold tabular-nums">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm font-medium uppercase tracking-wider text-success">
                {isRunning ? "Rest" : timeLeft === 0 && isRunning === false ? "Go!" : "Ready"}
              </p>
            </div>
          </div>

          <div className="mb-6 flex gap-3">
            {!isRunning ? (
              <Button onClick={start} size="lg" className="gap-2">
                <Play className="size-4" />
                Start Rest
              </Button>
            ) : (
              <Button onClick={reset} variant="outline" size="lg" className="gap-2">
                <RotateCcw className="size-4" />
                Skip
              </Button>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {presets.map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setDuration(sec);
                  if (!isRunning) setTimeLeft(0);
                }}
                disabled={isRunning}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  duration === sec && !isRunning
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } disabled:opacity-50`}
              >
                {sec < 60 ? `${sec}s` : `${sec / 60}m`}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="mt-4 flex items-center gap-2">
            <Label className="text-sm">Custom:</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) =>
                setDuration(Math.max(5, parseInt(e.target.value) || 5))
              }
              disabled={isRunning}
              className="w-20 text-center"
            />
            <span className="text-sm text-muted-foreground">sec</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CountdownTimer() {
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  const start = () => {
    setTimeLeft(duration);
    setIsRunning(true);
  };

  const reset = () => {
    clearTimer();
    setIsRunning(false);
    setTimeLeft(0);
  };

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const presets = [
    { label: "30s", value: 30 },
    { label: "1m", value: 60 },
    { label: "2m", value: 120 },
    { label: "3m", value: 180 },
    { label: "5m", value: 300 },
    { label: "10m", value: 600 },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-6 flex size-48 items-center justify-center rounded-full border-4 border-border">
            <svg className="absolute inset-0 size-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-border"
              />
              <circle
                cx="96"
                cy="96"
                r="90"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={565.48}
                strokeDashoffset={565.48 - (565.48 * progress) / 100}
                strokeLinecap="round"
                className="text-primary transition-all duration-1000"
              />
            </svg>
            <div className="text-center">
              <p className="text-4xl font-bold tabular-nums">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {!isRunning && timeLeft === 0 ? "Ready" : isRunning ? "Running" : "Paused"}
              </p>
            </div>
          </div>

          <div className="mb-6 flex gap-3">
            {!isRunning && timeLeft === 0 ? (
              <Button onClick={start} size="lg" className="gap-2">
                <Play className="size-4" />
                Start
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setIsRunning(!isRunning)}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  {isRunning ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  {isRunning ? "Pause" : "Resume"}
                </Button>
                <Button onClick={reset} variant="outline" size="lg" className="gap-2">
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
              </>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  setDuration(p.value);
                  if (!isRunning) setTimeLeft(0);
                }}
                disabled={isRunning}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  duration === p.value && !isRunning
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                } disabled:opacity-50`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="mt-4 flex items-center gap-2">
            <Label className="text-sm">Custom:</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) =>
                setDuration(Math.max(10, parseInt(e.target.value) || 10))
              }
              disabled={isRunning}
              className="w-20 text-center"
            />
            <span className="text-sm text-muted-foreground">sec</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
