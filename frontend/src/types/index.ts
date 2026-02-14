export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number | null;
  status: "pending" | "processing" | "completed" | "failed";
  chunk_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Chunk {
  id: string;
  chunk_index: number;
  content: string;
  token_count: number | null;
  created_at: string;
}

export interface DocumentDetail extends Document {
  chunks: Chunk[];
}

export interface SearchRequest {
  query: string;
  top_k?: number;
  threshold?: number;
}

export interface SearchResultItem {
  chunk_id: string;
  document_id: string;
  filename: string;
  chunk_index: number;
  content: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  total: number;
}

export interface ChatSession {
  id: string;
  title: string;
  persona_id: string | null;
  llm_provider: string;
  created_at: string;
  updated_at: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  context_chunks: string[] | null;
  created_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export interface Persona {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  is_default: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string | null;
  category: string;
  updated_at: string | null;
}

export interface DbQueryResponse {
  columns: string[];
  rows: unknown[][];
  row_count: number;
}
