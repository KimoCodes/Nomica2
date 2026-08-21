"use client";

import { useEffect, useRef, useState } from "react";
import { getMessagesAction } from "@/actions/message.actions";
import { uploadChatImageAction } from "@/actions/upload.actions";
import { Spinner } from "@/components/ui/spinner";
import {
  connectSocket,
  disconnectSocket,
  getSocketClient,
  SOCKET_EVENTS,
} from "@/lib/socket";
import type {
  ConversationSummary,
  MessageItem,
  MessageReceivePayload,
  TypingPayload,
} from "@/types/socket";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  ArrowLeft,
  Circle,
} from "lucide-react";

type MessagingAppProps = {
  currentUserId: string;
  initialConversations: ConversationSummary[];
};

export function MessagingApp({
  currentUserId,
  initialConversations,
}: MessagingAppProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(
    initialConversations[0]?.id ?? null,
  );
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const activeIdRef = useRef(activeId);
  const stopTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId,
  );

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    const socket = connectSocket();

    function onConnect() {
      setConnected(true);
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onMessageReceive(message: MessageReceivePayload) {
      const currentActiveId = activeIdRef.current;

      if (message.conversationId !== currentActiveId) {
        setConversations((current) =>
          current.map((conversation) => {
            if (conversation.id !== message.conversationId) {
              return conversation;
            }

            const isIncoming = message.senderId !== currentUserId;
            const isDuplicateUpdate = conversation.lastMessage?.createdAt === message.createdAt &&
              conversation.lastMessage?.content === (message.content || "Image");

            return {
              ...conversation,
              updatedAt: message.createdAt,
              lastMessage: {
                content: message.content || "Image",
                createdAt: message.createdAt,
                senderId: message.senderId,
              },
              unreadCount:
                isIncoming && !isDuplicateUpdate
                  ? conversation.unreadCount + 1
                  : conversation.unreadCount,
            };
          }),
        );
        return;
      }

      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current.map((item) =>
            item.id === message.id ? message : item,
          );
        }
        return [...current, message];
      });

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === message.conversationId
            ? {
                ...conversation,
                updatedAt: message.createdAt,
                lastMessage: {
                  content: message.content || "Image",
                  createdAt: message.createdAt,
                  senderId: message.senderId,
                },
              }
            : conversation,
        ),
      );
    }

    function onTypingStart(payload: TypingPayload) {
      if (
        payload.conversationId === activeIdRef.current &&
        payload.userId !== currentUserId
      ) {
        setTypingUser(payload.userName);
      }
    }

    function onTypingStop(payload: TypingPayload) {
      if (
        payload.conversationId === activeIdRef.current &&
        payload.userId !== currentUserId
      ) {
        setTypingUser(null);
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, onMessageReceive);
    socket.on(SOCKET_EVENTS.TYPING_START, onTypingStart);
    socket.on(SOCKET_EVENTS.TYPING_STOP, onTypingStop);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVE, onMessageReceive);
      socket.off(SOCKET_EVENTS.TYPING_START, onTypingStart);
      socket.off(SOCKET_EVENTS.TYPING_STOP, onTypingStop);
      disconnectSocket();
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!activeId) {
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      const result = await getMessagesAction(activeId!);

      if (cancelled || !result.success || !result.data) {
        return;
      }

      setMessages(result.data.messages);

      const socket = getSocketClient();
      socket.emit(SOCKET_EVENTS.CONVERSATION_JOIN, { conversationId: activeId });

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeId
            ? { ...conversation, unreadCount: 0 }
            : conversation,
        ),
      );
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  function handleDraftChange(value: string) {
    setDraft(value);

    if (!activeId) return;

    const socket = getSocketClient();
    socket.emit(SOCKET_EVENTS.TYPING_START, { conversationId: activeId });

    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }

    stopTypingTimeoutRef.current = setTimeout(() => {
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId: activeId });
    }, 1200);
  }

  async function sendMessage(content: string, imageUrl?: string | null) {
    if (!activeId || isSending) return;

    setIsSending(true);
    setError(null);

    const socket = getSocketClient();
    socket.emit(
      SOCKET_EVENTS.MESSAGE_SEND,
      {
        conversationId: activeId,
        content,
        imageUrl: imageUrl ?? null,
      },
      (response: { success: boolean; error?: string }) => {
        if (!response?.success) {
          setError(response?.error ?? "Failed to send message");
        }
        setIsSending(false);
        setDraft("");
        socket.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId: activeId });
      },
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    await sendMessage(trimmed);
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !activeId) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);

    const upload = await uploadChatImageAction(formData);

    if (!upload.success || !upload.data) {
      setError(upload.error?.message ?? "Failed to upload image");
      setIsUploading(false);
      event.target.value = "";
      return;
    }

    await sendMessage("", upload.data.url);
    setIsUploading(false);
    event.target.value = "";
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No conversations yet"
        description="Coaches and clients can chat once paired together."
      />
    );
  }

  return (
    <div className="grid h-[calc(100dvh-8rem)] overflow-hidden rounded-2xl border border-border/50 bg-card shadow-premium lg:grid-cols-[340px_1fr]">
      <aside
        className={cn(
          "border-r border-border/50",
          activeId && "hidden lg:block",
        )}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <h2 className="font-semibold">Messages</h2>
          <div className="flex items-center gap-2">
            <Circle
              className={cn(
                "size-2",
                connected ? "fill-success text-success" : "fill-muted-foreground text-muted-foreground",
              )}
            />
            <span className="text-xs text-muted-foreground">
              {connected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
        <div className="overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setActiveId(conversation.id)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-border/50 px-5 py-4 text-left transition-all duration-200 hover:bg-muted/50",
                activeId === conversation.id && "bg-muted/80",
              )}
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {conversation.otherUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">
                    {conversation.otherUser.name}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <Badge className="ml-auto shrink-0">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {conversation.lastMessage?.content ?? "No messages yet"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section
        className={cn(
          "flex min-h-0 flex-col",
          !activeId && "hidden lg:flex",
        )}
      >
        {activeConversation ? (
          <>
            <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setActiveId(null)}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {activeConversation.otherUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold">
                  {activeConversation.otherUser.name}
                </h3>
                {typingUser && (
                  <p className="text-xs text-primary">
                    {typingUser} is typing...
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {messages.map((message) => {
                const isMine = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      isMine ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5",
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      {message.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={message.imageUrl}
                          alt="Shared image"
                          className="mb-2 max-h-64 rounded-xl object-cover"
                        />
                      )}
                      {message.content && (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                      <div
                        className={cn(
                          "mt-1.5 flex items-center gap-2 text-[10px]",
                          isMine
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        <span>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMine && (
                          <span>{message.readAt ? "Read" : "Sent"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t border-border/50 p-4">
              {error && (
                <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>
              )}
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={isUploading ? "Uploading image" : "Upload image"}
                >
                  {isUploading ? <Spinner size="sm" /> : <ImageIcon className="size-5" />}
                </Button>
                <Input
                  value={draft}
                  onChange={(event) => handleDraftChange(event.target.value)}
                  placeholder="Write a message..."
                  disabled={isSending || isUploading}
                  className="flex-1"
                  aria-label="Type a message"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSending || !draft.trim()}
                  className="shrink-0"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </section>
    </div>
  );
}
