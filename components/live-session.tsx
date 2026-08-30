"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Send, Phone, PhoneOff, AlertCircle } from "lucide-react";

type LiveMessage = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "text" | "exercise" | "correction" | "encouragement";
  timestamp: Date;
};

type LiveSessionProps = {
  sessionId: string;
  userId: string;
  isCoach: boolean;
  onEndSession?: () => void;
};

export function LiveSession({ sessionId, userId, isCoach, onEndSession }: LiveSessionProps) {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<"waiting" | "active" | "ended">("waiting");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<{ emit: (event: string, data?: unknown) => void; disconnect: () => void } | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const connect = async () => {
      try {
        const { io } = await import("socket.io-client");
        const socket = io("/live-coaching", {
          auth: { userId },
        });

        socket.on("connect", () => {
          setConnected(true);
          socket.emit("join-session", sessionId);
        });

        socket.on("session-joined", (data: { session: { messages: LiveMessage[]; status: string } }) => {
          setMessages(data.session.messages);
          setStatus(data.session.status as "waiting" | "active" | "ended");
        });

        socket.on("session-started", () => {
          setStatus("active");
        });

        socket.on("new-message", (data: { message: LiveMessage }) => {
          setMessages((prev) => [...prev, data.message]);
        });

        socket.on("session-ended", () => {
          setStatus("ended");
          onEndSession?.();
        });

        socket.on("disconnect", () => {
          setConnected(false);
        });

        socketRef.current = socket;
        cleanup = () => socket.disconnect();
      } catch (error) {
        console.error("Failed to connect:", error);
      }
    };

    connect();

    return () => {
      cleanup?.();
    };
  }, [sessionId, userId, onEndSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit("send-message", { content: input.trim(), type: "text" });
    setInput("");
  };

  const handleEndSession = () => {
    if (!socketRef.current) return;
    socketRef.current.emit("end-session");
    onEndSession?.();
  };

  const statusColors = {
    waiting: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    ended: "bg-gray-100 text-gray-800",
  };

  const messageTypes = {
    text: "",
    exercise: "bg-blue-50 border-blue-200",
    correction: "bg-yellow-50 border-yellow-200",
    encouragement: "bg-green-50 border-green-200",
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Live Session
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[status]}>
              {connected ? status : "disconnected"}
            </Badge>
            {status === "active" && (
              <Button variant="destructive" size="sm" onClick={handleEndSession}>
                <PhoneOff className="mr-1 h-4 w-4" />
                End
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
        {status === "waiting" && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="animate-pulse">
              <Phone className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="mt-4 text-muted-foreground">
              {isCoach ? "Waiting for client to join..." : "Waiting for coach to start the session..."}
            </p>
          </div>
        )}

        {status === "ended" && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Session ended</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 border ${
                msg.senderId === userId
                  ? "bg-primary text-primary-foreground"
                  : messageTypes[msg.type] || "bg-muted"
              }`}
            >
              {msg.senderId !== userId && (
                <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>
              )}
              {msg.type === "exercise" ? (
                <div className="space-y-1">
                  <p className="font-medium">New Exercise</p>
                  {(() => {
                    try {
                      const data = JSON.parse(msg.content);
                      return (
                        <p className="text-sm">
                          {data.exerciseName} - {data.sets}x{data.reps}
                          {data.notes && ` (${data.notes})`}
                        </p>
                      );
                    } catch {
                      return <p className="text-sm">{msg.content}</p>;
                    }
                  })()}
                </div>
              ) : msg.type === "correction" ? (
                <div className="space-y-1">
                  <p className="font-medium text-yellow-800">Form Correction</p>
                  {(() => {
                    try {
                      const data = JSON.parse(msg.content);
                      return <p className="text-sm">{data.correction}</p>;
                    } catch {
                      return <p className="text-sm">{msg.content}</p>;
                    }
                  })()}
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      {status === "active" && (
        <div className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}
