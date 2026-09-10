export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export type AIModel = "demo" | "assistant" | "fast";

export interface DemoSettings {
  appearance: "dark" | "light";
  enterToSend: boolean;
  aiMode: "demo" | "real";
}

export interface DemoUser {
  name: string;
  email: string;
}
