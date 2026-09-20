export type Role = 'user' | 'assistant' | 'system';

export type ChatMode = 'general' | 'rules' | 'recommend' | 'setup' | 'explain' | 'summary';

export interface Attachment {
  type: 'image' | 'file';
  mimeType: string;
  name: string;
  data: string; // base64 data URL
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachment?: Attachment;
  wasVoice?: boolean;
  mode?: ChatMode;
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
  messages: {
    role: Role;
    content: string;
    attachment?: Attachment;
  }[];
  mode?: ChatMode;
  model?: string;
  apiKey?: string; // optional client override
  gameContext?: string;
}
