export const SOCKET_EVENTS = {
  MESSAGE_SEND: "message:send",
  MESSAGE_RECEIVE: "message:receive",
  CONVERSATION_JOIN: "conversation:join",
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export type MessageSendPayload = {
  conversationId: string;
  content: string;
  imageUrl?: string | null;
};

export type MessageReceivePayload = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl: string | null;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
};

export type ConversationJoinPayload = {
  conversationId: string;
};

export type TypingPayload = {
  conversationId: string;
  userId: string;
  userName: string;
};

export type ConversationSummary = {
  id: string;
  clientId: string;
  coachId: string;
  updatedAt: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
};

export type MessageItem = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl: string | null;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
};
