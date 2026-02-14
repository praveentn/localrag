import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";
import { toast } from "sonner";

export function useChatSessions() {
  return useQuery({
    queryKey: ["chat-sessions"],
    queryFn: () => chatApi.listSessions(),
  });
}

export function useChatSession(id: string | undefined) {
  return useQuery({
    queryKey: ["chat-sessions", id],
    queryFn: () => chatApi.getSession(id!),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      personaId,
      llmProvider,
    }: {
      personaId?: string;
      llmProvider?: string;
    }) => chatApi.createSession(personaId, llmProvider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create session: ${error.message}`);
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatApi.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      toast.success("Session deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete session: ${error.message}`);
    },
  });
}
