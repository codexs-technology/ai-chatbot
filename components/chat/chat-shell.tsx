"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  PencilLine,
  Plus,
  Search,
  SendHorizonal,
  Settings,
  Sparkles,
  StopCircle,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { streamDemoResponse } from "@/lib/ai/demo";
import type { AIModel, ChatConversation, DemoSettings, Message } from "@/types/chat";
import { getStoredConversations, getStoredSettings, saveStoredConversations, saveStoredSettings } from "@/lib/storage";

const MODEL_OPTIONS: { value: AIModel; label: string; description: string }[] = [
  { value: "demo", label: "Demo AI", description: "Fast local simulation" },
  { value: "assistant", label: "AI Assistant", description: "OpenAI-compatible" },
  { value: "fast", label: "Fast Assistant", description: "Quick response mode" },
];

const DEFAULT_SETTINGS: DemoSettings = { appearance: "dark", enterToSend: true, aiMode: "demo" };

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createEmptyConversation = (): ChatConversation => ({
  id: createId(),
  title: "New chat",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [],
});

const smartTitle = (prompt: string) => {
  const value = prompt.trim();
  if (!value) return "New chat";
  const trimmed = value.replace(/\s+/g, " ");
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}...` : trimmed;
};

const formatDateGroup = (date: Date) => {
  const today = new Date();
  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Previous 7 Days";
  return "Older";
};

export function ChatShell() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [error, setError] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [settings, setSettings] = useState<DemoSettings>(DEFAULT_SETTINGS);
  const [model, setModel] = useState<AIModel>("demo");
  const [isStreaming, setIsStreaming] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storageConversations = getStoredConversations();
    const storedSettings = getStoredSettings();

    setConversations(storageConversations);
    setSelectedId(storageConversations[0]?.id ?? null);
    setSettings(storedSettings);
    setModel(storedSettings.aiMode === "real" ? "assistant" : "demo");
  }, []);

  useEffect(() => {
    saveStoredConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveStoredSettings(settings);
    if (settings.aiMode === "real") {
      setModel("assistant");
    } else {
      setModel("demo");
    }
  }, [settings]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [draft]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations, isGenerating]);

  const activeConversation = conversations.find((conversation) => conversation.id === selectedId) ?? null;

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return conversations;
    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(value),
    );
  }, [conversations, search]);

  const groupedConversations = useMemo(() => {
    return {
      Today: filteredConversations.filter((conversation) => formatDateGroup(new Date(conversation.updatedAt)) === "Today"),
      Yesterday: filteredConversations.filter((conversation) => formatDateGroup(new Date(conversation.updatedAt)) === "Yesterday"),
      "Previous 7 Days": filteredConversations.filter((conversation) => formatDateGroup(new Date(conversation.updatedAt)) === "Previous 7 Days"),
      Older: filteredConversations.filter((conversation) => formatDateGroup(new Date(conversation.updatedAt)) === "Older"),
    };
  }, [filteredConversations]);

  const updateConversation = (conversationId: string, updater: (conversation: ChatConversation) => ChatConversation) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId ? updater(conversation) : conversation,
      ),
    );
  };

  const createNewConversation = () => {
    const nextConversation = createEmptyConversation();
    setConversations((current) => [nextConversation, ...current]);
    setSelectedId(nextConversation.id);
    setDraft("");
    setError("");
    setSidebarOpen(false);
    setActiveMenuId(null);
  };

  const handleSend = async (promptOverride?: string, regenerateIndex?: number) => {
    const nextPrompt = (promptOverride ?? draft).trim();
    if (!nextPrompt) {
      setError("Please enter a message before sending.");
      return;
    }

    if (!selectedId && conversations.length === 0) {
      const emptyConversation = createEmptyConversation();
      setConversations([emptyConversation]);
      setSelectedId(emptyConversation.id);
    }

    const targetConversation =
      conversations.find((conversation) => conversation.id === selectedId) ??
      conversations[0] ??
      createEmptyConversation();

    const nowIso = new Date().toISOString();
    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: nextPrompt,
      timestamp: nowIso,
    };

    const baseMessages = regenerateIndex !== undefined
      ? targetConversation.messages.slice(0, regenerateIndex + 1)
      : targetConversation.messages;

    const conversationTitle =
      targetConversation.messages.length === 0 ? smartTitle(nextPrompt) : targetConversation.title;

    const updatedConversation: ChatConversation = {
      ...targetConversation,
      title: conversationTitle,
      updatedAt: nowIso,
      messages: [...baseMessages, userMessage],
    };

    const assistantId = createId();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    const conversationWithAssistant = {
      ...updatedConversation,
      messages: [...updatedConversation.messages, assistantMessage],
    };

    setConversations((current) => 
      current.map((conversation) =>
        conversation.id === targetConversation.id ? conversationWithAssistant : conversation,
      ),
    );
    setSelectedId(targetConversation.id);
    setDraft("");
    setError("");
    setIsGenerating(true);
    setIsStreaming(true);

    try {
      const history = conversationWithAssistant.messages.slice(0, -1);
      let generatedContent = "";

      if (model === "demo" || settings.aiMode === "demo") {
        await streamDemoResponse(
          nextPrompt,
          (chunk) => {
            generatedContent += chunk;
            setConversations((current) =>
              current.map((conversation) =>
                conversation.id === targetConversation.id
                  ? {
                      ...conversation,
                      updatedAt: new Date().toISOString(),
                      messages: conversation.messages.map((message) =>
                        message.id === assistantId
                          ? { ...message, content: generatedContent }
                          : message,
                      ),
                    }
                  : conversation,
              ),
            );
          },
          history,
        );
      } else {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            model: MODEL_OPTIONS.find((entry) => entry.value === model)?.label ?? "AI Assistant",
          }),
        });

        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload?.error ?? "AI service is currently unavailable.");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("AI response stream unavailable.");

        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload) as { text?: string };
              if (parsed.text) {
                generatedContent += parsed.text;
                setConversations((current) =>
                  current.map((conversation) =>
                    conversation.id === targetConversation.id
                      ? {
                          ...conversation,
                          updatedAt: new Date().toISOString(),
                          messages: conversation.messages.map((message) =>
                            message.id === assistantId
                              ? { ...message, content: generatedContent }
                              : message,
                          ),
                        }
                      : conversation,
                  ),
                );
              }
            } catch {
              // Ignore malformed payloads during stream parsing.
            }
          }
        }
      }

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === targetConversation.id
            ? {
                ...conversation,
                updatedAt: new Date().toISOString(),
                messages: conversation.messages.map((message) =>
                  message.id === assistantId
                    ? { ...message, content: generatedContent || "I’m here to help with that. Let me break it down clearly." }
                    : message,
                ),
              }
            : conversation,
        ),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setError(message);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === targetConversation.id
            ? {
                ...conversation,
                updatedAt: new Date().toISOString(),
                messages: conversation.messages.map((item) =>
                  item.id === assistantId
                    ? { ...item, content: `I hit an issue while generating that response. ${message}` }
                    : item,
                ),
              }
            : conversation,
        ),
      );
    } finally {
      setIsGenerating(false);
      setIsStreaming(false);
    }
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    setIsStreaming(false);
    setError("Generation was stopped.");
  };

  const deleteConversation = (conversationId: string) => {
    const remaining = conversations.filter((conversation) => conversation.id !== conversationId);
    setConversations(remaining);
    if (selectedId === conversationId) {
      setSelectedId(remaining[0]?.id ?? null);
    }
    setDeleteTargetId(null);
    setActiveMenuId(null);
  };

  const renameConversation = (conversationId: string) => {
    const target = conversations.find((conversation) => conversation.id === conversationId);
    if (!target) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setRenameId(null);
      return;
    }

    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, title: trimmed, updatedAt: new Date().toISOString() }
          : conversation,
      ),
    );
    setRenameId(null);
    setRenameValue("");
  };

  const copyMessage = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(null), 1400);
    } catch {
      setError("Clipboard access failed. Please copy the text manually.");
    }
  };

  const regenerateAssistant = (conversation: ChatConversation) => {
    const lastUserIndex = [...conversation.messages].reverse().findIndex((message) => message.role === "user");
    if (lastUserIndex === -1) return;
    const userIndex = conversation.messages.length - 1 - lastUserIndex;
    const prompt = conversation.messages[userIndex]?.content ?? "";
    const trimmedMessages = conversation.messages.slice(0, userIndex + 1);
    const resetConversation = { ...conversation, messages: trimmedMessages };
    setConversations((current) =>
      current.map((item) => (item.id === conversation.id ? resetConversation : item)),
    );
    void handleSend(prompt, userIndex);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (settings.enterToSend) {
      void handleSend();
    }
  };

  const suggestedPrompts = [
    "Explain artificial intelligence",
    "Write a professional email",
    "Create a React component",
    "Help me plan a project",
  ];

  return (
    <div className="flex h-screen bg-[#0b0b0c] text-white">
      <aside className={`border-r border-white/10 bg-[#111214] transition-all duration-200 ${isSidebarCollapsed ? "w-20" : "w-[280px]"} ${sidebarOpen ? "fixed inset-y-0 left-0 z-40 w-[86%] sm:w-[340px]" : "hidden md:flex"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
                  <Bot className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">AI Chatbot</span>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="hidden rounded-md border border-white/10 p-2 text-zinc-300 md:inline-flex"
                aria-label="Collapse sidebar"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="mx-auto rounded-md border border-white/10 p-2 text-zinc-300"
                aria-label="Expand sidebar"
              >
                <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
              </button>
            )}
          </div>

          {!isSidebarCollapsed && (
            <>
              <button
                type="button"
                onClick={createNewConversation}
                className="mx-3 mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
                <span>New Chat</span>
              </button>

              <div className="relative mx-3 mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  aria-label="Search conversations"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="w-full rounded-xl border border-white/10 bg-[#181a1d] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>
            </>
          )}

          <div className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
            {Object.entries(groupedConversations).map(([groupName, groupConversations]) => {
              if (!groupConversations.length) return null;
              return (
                <div key={groupName} className="mb-4">
                  {!isSidebarCollapsed && <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{groupName}</p>}
                  <div className="space-y-1.5">
                    {groupConversations.map((conversation) => (
                      <div key={conversation.id} className="relative">
                        <div className={`flex w-full items-center gap-2 rounded-xl transition ${selectedId === conversation.id ? "bg-white/8 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"} ${isSidebarCollapsed ? "justify-center px-0 py-3" : "px-2.5 py-2"}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(conversation.id);
                              setSidebarOpen(false);
                            }}
                            className={`flex flex-1 items-center justify-between text-left ${isSidebarCollapsed ? "justify-center" : ""}`}
                          >
                            {!isSidebarCollapsed && (
                              <span className="truncate pr-2 text-sm font-medium">{conversation.title}</span>
                            )}
                          </button>
                          {!isSidebarCollapsed && (
                            <div className="relative shrink-0">
                              <button
                                type="button"
                                aria-label={`Open conversation actions for ${conversation.title}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setActiveMenuId((current) => (current === conversation.id ? null : conversation.id));
                                }}
                                className="rounded-md p-1.5 hover:bg-white/5"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                              {activeMenuId === conversation.id && (
                                <div className="absolute right-0 top-9 z-10 w-36 rounded-xl border border-white/10 bg-[#181a1d] p-1 shadow-2xl">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setRenameId(conversation.id);
                                      setRenameValue(conversation.title);
                                      setActiveMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-zinc-200 hover:bg-white/5"
                                  >
                                    <PencilLine className="h-3.5 w-3.5" />
                                    Rename
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setDeleteTargetId(conversation.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {renameId === conversation.id && (
                          <div className="mt-2 rounded-xl border border-white/10 bg-[#181a1d] p-2">
                            <input
                              value={renameValue}
                              onChange={(event) => setRenameValue(event.target.value)}
                              aria-label="Rename conversation"
                              className="w-full rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-white/10"
                              autoFocus
                            />
                            <div className="mt-2 flex justify-end gap-2">
                              <button type="button" onClick={() => setRenameId(null)} className="rounded-md px-2 py-1.5 text-xs text-zinc-400 hover:bg-white/5">Cancel</button>
                              <button type="button" onClick={() => renameConversation(conversation.id)} className="rounded-md bg-white px-2 py-1.5 text-xs font-medium text-black">Save</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredConversations.length === 0 && (
              <div className="mt-8 rounded-xl border border-dashed border-white/10 p-4 text-sm text-zinc-400">
                No conversations found
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-3 rounded-xl px-2 py-2 text-zinc-300 hover:bg-white/5">
                <Settings className="h-4 w-4" />
                <span className="text-sm">Settings</span>
              </div>
              <div className="mt-2 flex items-center gap-3 rounded-xl px-2 py-2 text-zinc-300 hover:bg-white/5">
                <UserRound className="h-4 w-4" />
                <span className="text-sm">Demo User</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#111214]/80 px-4 py-3 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 md:inline-flex"
              aria-label="Toggle sidebar"
            >
              {isSidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black">
                <Bot className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-white">AI Chatbot</span>
            </div>
          </div>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="relative inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#181a1d] px-3 py-2">
              <Sparkles className="h-4 w-4 text-zinc-300" />
              <select
                aria-label="Select model"
                value={model}
                onChange={(event) => setModel(event.target.value as AIModel)}
                className="bg-transparent pr-6 text-sm text-white outline-none"
              >
                {MODEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#111214] text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={createNewConversation} className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 md:inline-flex">
              <MessageSquarePlus className="h-4 w-4" />
              New chat
            </button>
            <a href="/settings" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10" aria-label="Open settings">
              <Settings className="h-4 w-4" />
            </a>
          </div>
        </header>

        <main className="relative flex flex-1 flex-col overflow-hidden bg-[#0b0b0c]">
          {sidebarOpen && (
            <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-28 pt-6 md:px-8">
            {activeConversation && activeConversation.messages.length > 0 ? (
              <div className="mx-auto w-full max-w-4xl space-y-5">
                {activeConversation.messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl border px-4 py-3 md:max-w-3xl ${message.role === "user" ? "border-white/10 bg-[#1e2024] text-white" : "border-white/10 bg-[#111214] text-zinc-100"}`}>
                      {message.role === "assistant" && (
                        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-400">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-black">
                            <Bot className="h-3.5 w-3.5" />
                          </div>
                          AI Assistant
                        </div>
                      )}

                      <div className="prose prose-invert max-w-none break-words text-[15px] leading-7 text-zinc-100 prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-pre:my-3 prose-code:text-[0.9em]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || " "}</ReactMarkdown>
                      </div>

                      {message.role === "assistant" && (
                        <div className="mt-4 flex items-center gap-2">
                          <button type="button" onClick={() => copyMessage(message)} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10">
                            {copiedMessageId === message.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copiedMessageId === message.id ? "Copied" : "Copy"}
                          </button>
                          <button type="button" onClick={() => regenerateAssistant(activeConversation)} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-200 hover:bg-white/10">
                            <Sparkles className="h-3 w-3" />
                            Regenerate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111214] px-4 py-3 text-zinc-200">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking…</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center pb-16 pt-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                  <Bot className="h-8 w-8" />
                </div>
                <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">How can I help you today?</h1>
                <p className="mt-3 max-w-lg text-sm text-zinc-400 md:text-base">Ask a question, write something, analyze an idea, or explore a topic.</p>
                <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void handleSend(prompt)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-200 hover:bg-white/10"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#0b0b0c]/95 px-4 pb-4 pt-3 md:px-8">
            {error && (
              <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl rounded-2xl border border-white/10 bg-[#111214] p-3 shadow-lg shadow-black/20">
              <textarea
                ref={textareaRef}
                aria-label="Message AI Chatbot"
                placeholder="Message AI Chatbot..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (settings.enterToSend) {
                      void handleSend();
                    }
                  }
                }}
                rows={1}
                className="max-h-[180px] min-h-[52px] w-full resize-none bg-transparent px-2 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <button type="button" className="rounded-lg p-2 hover:bg-white/5" aria-label="Add attachment">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isGenerating && (
                    <button type="button" onClick={stopGeneration} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/15">
                      <StopCircle className="h-4 w-4" />
                      Stop generating
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!draft.trim() || isGenerating}
                    className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <SendHorizonal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>

      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111214] p-5 shadow-2xl">
            <h3 className="text-lg font-semibold">Delete conversation?</h3>
            <p className="mt-2 text-sm text-zinc-400">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteTargetId(null)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5">Cancel</button>
              <button type="button" onClick={() => deleteConversation(deleteTargetId)} className="rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-400">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
