export interface Message {
  id: string;
  content: string;
  type: 'ai' | 'user';
  timestamp: string;
}

export interface Conversation {
  session_id: string;
  name_contact: string;
  messages: Message[];
  hasNewMessages?: boolean;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface ConversationResponse {
  messages: Message[];
}