import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { AdvertiserApplication } from "@shared/schema";

export function useAdvertiserApplications() {
  return useQuery<AdvertiserApplication[]>({
    queryKey: ["/api/advertiser-applications"],
  });
}

export function useUpdateApplicationStatus() {
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/advertiser-applications/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertiser-applications"] });
    },
  });
}

export function useDeleteAdvertiserApplication() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/advertiser-applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertiser-applications"] });
    },
  });
}
