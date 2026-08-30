"use client";

import { useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/types/socket";
import type { PrAchievedPayload, CoachAlertPayload } from "@/types/socket";

let socket: Socket | null = null;

function getSocket(): Socket {
  if (socket) return socket;
  socket = io({ path: "/api/socket/io", autoConnect: false });
  return socket;
}

export function useSocket(options?: {
  onPrAchieved?: (payload: PrAchievedPayload) => void;
  onCoachAlert?: (payload: CoachAlertPayload) => void;
}) {
  useEffect(() => {
    const s = getSocket();
    if (!s.connected) s.connect();

    const handlePr = (payload: PrAchievedPayload) => options?.onPrAchieved?.(payload);
    const handleAlert = (payload: CoachAlertPayload) => options?.onCoachAlert?.(payload);

    s.on(SOCKET_EVENTS.PR_ACHIEVED, handlePr);
    s.on(SOCKET_EVENTS.COACH_ALERT, handleAlert);

    return () => {
      s.off(SOCKET_EVENTS.PR_ACHIEVED, handlePr);
      s.off(SOCKET_EVENTS.COACH_ALERT, handleAlert);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.onPrAchieved, options?.onCoachAlert]);

  const disconnect = useCallback(() => {
    socket?.disconnect();
    socket = null;
  }, []);

  return { socket: getSocket(), disconnect };
}
