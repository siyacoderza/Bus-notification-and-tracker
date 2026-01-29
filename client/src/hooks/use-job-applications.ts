import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type JobApplication, type InsertJobApplication, type Job } from "@shared/schema";

type JobApplicationWithJob = JobApplication & { job: Job };

export function useJobApplications(jobId?: number) {
  return useQuery<JobApplicationWithJob[]>({
    queryKey: ["/api/job-applications", { jobId }],
    queryFn: async () => {
      const url = jobId ? `/api/job-applications?jobId=${jobId}` : "/api/job-applications";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
  });
}

export function useJobApplicationsByEmail(email: string) {
  return useQuery<JobApplicationWithJob[]>({
    queryKey: ["/api/job-applications/by-email", email],
    queryFn: async () => {
      const res = await fetch(`/api/job-applications/by-email/${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("Failed to fetch applications");
      return res.json();
    },
    enabled: !!email,
  });
}

export function useCreateJobApplication() {
  return useMutation({
    mutationFn: async (data: InsertJobApplication) => {
      const res = await apiRequest("POST", "/api/job-applications", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
    },
  });
}

export function useUpdateJobApplication() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertJobApplication> }) => {
      const res = await apiRequest("PUT", `/api/job-applications/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
    },
  });
}

export function useDeleteJobApplication() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/job-applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-applications"] });
    },
  });
}
