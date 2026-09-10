import type { ChatConversation, DemoSettings, DemoUser } from "@/types/chat";

export const CHAT_STORAGE_KEY = "ai-chatbot-demo-conversations";
export const SESSION_STORAGE_KEY = "ai-chatbot-demo-session";
export const SETTINGS_STORAGE_KEY = "ai-chatbot-demo-settings";

export function getStoredConversations(): ChatConversation[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(CHAT_STORAGE_KEY);
    return value ? (JSON.parse(value) as ChatConversation[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredConversations(conversations: ChatConversation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
}

export function getStoredSession(): DemoUser | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return value ? (JSON.parse(value) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function saveStoredSession(user: DemoUser | null) {
  if (typeof window === "undefined") return;

  if (!user) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

export function getStoredSettings(): DemoSettings {
  if (typeof window === "undefined") {
    return { appearance: "dark", enterToSend: true, aiMode: "demo" };
  }

  try {
    const value = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return value
      ? ({ ...{ appearance: "dark", enterToSend: true, aiMode: "demo" }, ...JSON.parse(value) } as DemoSettings)
      : { appearance: "dark", enterToSend: true, aiMode: "demo" };
  } catch {
    return { appearance: "dark", enterToSend: true, aiMode: "demo" };
  }
}

export function saveStoredSettings(settings: DemoSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
