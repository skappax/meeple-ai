export type Role = 'user' | 'assistant' | 'system';

export type ChatMode = 'general' | 'rules' | 'recommend' | 'setup' | 'explain';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  mode: ChatMode;
  gameContext?: string; // Optional game currently being discussed (e.g. "Catan")
}

export interface SendMessagePayload {
  messages: { role: Role; content: string }[];
  mode?: ChatMode;
  model?: string;
  apiKey?: string; // optional client override
}
