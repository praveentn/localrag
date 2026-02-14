import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  Send,
  Bot,
  User,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useChatSessions,
  useChatSession,
  useCreateSession,
  useDeleteSession,
} from "@/hooks/use-chat";
import { usePersonas } from "@/hooks/use-admin";
import { chatApi } from "@/lib/api";
import type { ChatMessage } from "@/types";

export function ChatPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("ollama");
  const [selectedPersona, setSelectedPersona] = useState<string>("none");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions } = useChatSessions();
  const { data: session, refetch: refetchSession } = useChatSession(sessionId);
  const { data: personas } = usePersonas();
  const createSession = useCreateSession();
  const deleteSession = useDeleteSession();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, streamingContent, scrollToBottom]);

  const handleNewChat = async () => {
    const result = await createSession.mutateAsync({
      personaId: selectedPersona === "none" ? undefined : selectedPersona,
      llmProvider: selectedProvider,
    });
    navigate(`/chat/${result.id}`);
  };

  const handleDeleteSession = async (id: string) => {
    await deleteSession.mutateAsync(id);
    if (sessionId === id) {
      navigate("/chat");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || isStreaming) return;
    const message = input.trim();
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    try {
      let accumulated = "";
      for await (const token of chatApi.sendMessageStream(sessionId, message)) {
        accumulated += token;
        setStreamingContent(accumulated);
      }
    } catch {
      setStreamingContent("Error: Failed to get response");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      refetchSession();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messages: ChatMessage[] = session?.messages || [];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Session List */}
      <div className="w-64 shrink-0 flex flex-col border rounded-lg">
        <div className="p-3 border-b">
          <Button onClick={handleNewChat} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="p-3 space-y-2 border-b">
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="LLM Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ollama">Ollama</SelectItem>
              <SelectItem value="azure_openai">Azure OpenAI</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPersona} onValueChange={setSelectedPersona}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select Persona" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Default</SelectItem>
              {personas?.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions?.map((s) => (
              <div
                key={s.id}
                className={`group flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer text-sm ${
                  sessionId === s.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => navigate(`/chat/${s.id}`)}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{s.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(s.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {(!sessions || sessions.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No conversations yet
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col border rounded-lg">
        {sessionId ? (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2.5 max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.context_chunks && msg.context_chunks.length > 0 && (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">
                            {msg.context_chunks.length} source
                            {msg.context_chunks.length > 1 ? "s" : ""} used
                          </Badge>
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {streamingContent && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-lg px-4 py-2.5 bg-muted max-w-[80%]">
                      <p className="text-sm whitespace-pre-wrap">
                        {streamingContent}
                      </p>
                    </div>
                  </div>
                )}

                {isStreaming && !streamingContent && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-lg px-4 py-2.5 bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-4">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Select or start a conversation</p>
            <p className="text-sm">
              Choose a chat from the sidebar or create a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
