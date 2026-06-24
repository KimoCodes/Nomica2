"use client";

import { io, type Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "@/types/socket";

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    socket = io({
      path: "/api/socket/io",
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
}

export function connectSocket(): Socket {
  const client = getSocketClient();

  if (!client.connected) {
    client.connect();
  }

  return client;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export { SOCKET_EVENTS };
