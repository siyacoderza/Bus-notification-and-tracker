import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertNotification } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useNotifications(onlyMyRoutes = false) {
  return useQuery({
    queryKey: [api.notifications.list.path, onlyMyRoutes],
    queryFn: async () => {
      const url = `${api.notifications.list.path}${onlyMyRoutes ? '?onlyMyRoutes=true' : ''}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return api.notifications.list.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Poll every 5s for truly "instant" updates
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertNotification) => {
      // Ensure date is handled if necessary, currently activeUntil is timestamp
      const validated = api.notifications.create.input.parse(data);
      const res = await fetch(api.notifications.create.path, {
        method: api.notifications.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.notifications.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error('Failed to create notification');
      }
      return api.notifications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.notifications.list.path] });
      toast({ title: "Alert Published", description: "Passengers will be notified immediately." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
