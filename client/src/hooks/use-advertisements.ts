import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Advertisement, InsertAdvertisement } from "@shared/schema";

export function useAdvertisements(activeOnly: boolean = true) {
  return useQuery<Advertisement[]>({
    queryKey: ["/api/advertisements", { active: activeOnly }],
  });
}

export function useAdvertisement(id: number) {
  return useQuery<Advertisement>({
    queryKey: ["/api/advertisements", id],
    enabled: !!id,
  });
}

export function useRouteAdvertisements(routeId: number) {
  return useQuery<Advertisement[]>({
    queryKey: ["/api/routes", routeId, "advertisements"],
    enabled: !!routeId,
  });
}

export function useCreateAdvertisement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ad: InsertAdvertisement) => {
      const response = await apiRequest("POST", "/api/advertisements", ad);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
    },
  });
}

export function useUpdateAdvertisement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InsertAdvertisement> & { id: number }) => {
      const response = await apiRequest("PUT", `/api/advertisements/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
    },
  });
}

export function useDeleteAdvertisement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/advertisements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/advertisements"] });
    },
  });
}
