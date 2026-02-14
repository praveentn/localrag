import { useMutation } from "@tanstack/react-query";
import { searchApi } from "@/lib/api";

export function useSearch() {
  return useMutation({
    mutationFn: ({
      query,
      topK,
      threshold,
    }: {
      query: string;
      topK?: number;
      threshold?: number;
    }) => searchApi.search(query, topK, threshold),
  });
}
