import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";
import type { Persona } from "@/types";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => adminApi.getSettings(),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminApi.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Setting updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update setting: ${error.message}`);
    },
  });
}

export function useDbQuery() {
  return useMutation({
    mutationFn: (sql: string) => adminApi.executeQuery(sql),
    onError: (error: Error) => {
      toast.error(`Query failed: ${error.message}`);
    },
  });
}

export function usePersonas() {
  return useQuery({
    queryKey: ["personas"],
    queryFn: () => adminApi.listPersonas(),
  });
}

export function useCreatePersona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Persona, "id" | "created_at" | "updated_at">) =>
      adminApi.createPersona(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      toast.success("Persona created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create persona: ${error.message}`);
    },
  });
}

export function useUpdatePersona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Persona> }) =>
      adminApi.updatePersona(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      toast.success("Persona updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update persona: ${error.message}`);
    },
  });
}

export function useDeletePersona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deletePersona(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personas"] });
      toast.success("Persona deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete persona: ${error.message}`);
    },
  });
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => adminApi.health(),
    refetchInterval: 30000,
  });
}
