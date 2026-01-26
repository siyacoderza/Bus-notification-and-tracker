import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Job, type InsertJob } from "@shared/schema";

export function useJobs(activeOnly: boolean = true) {
  return useQuery<Job[]>({
    queryKey: ["/api/jobs", { activeOnly }],
    queryFn: async () => {
      const res = await fetch(`/api/jobs?active=${activeOnly}`);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return res.json();
    },
  });
}

export function useJob(id: number) {
  return useQuery<Job>({
    queryKey: ["/api/jobs", id],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error("Failed to fetch job");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateJob() {
  return useMutation({
    mutationFn: async (data: InsertJob) => {
      const res = await apiRequest("POST", "/api/jobs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
  });
}

export function useUpdateJob() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertJob> }) => {
      const res = await apiRequest("PUT", `/api/jobs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
  });
}

export function useDeleteJob() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
  });
}
