import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSubscriptions() {
  return useQuery({
    queryKey: [api.subscriptions.list.path],
    queryFn: async () => {
      const res = await fetch(api.subscriptions.list.path, { credentials: "include" });
      if (res.status === 401) return null; // Not logged in
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      return api.subscriptions.list.responses[200].parse(await res.json());
    },
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (routeId: number) => {
      const res = await fetch(api.subscriptions.create.path, {
        method: api.subscriptions.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routeId }),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Please log in to subscribe");
        throw new Error('Failed to subscribe');
      }
      return api.subscriptions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subscriptions.list.path] });
      toast({ title: "Subscribed", description: "You will receive alerts for this route." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUnsubscribe() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (routeId: number) => {
      const url = buildUrl(api.subscriptions.delete.path, { routeId });
      const res = await fetch(url, { 
        method: api.subscriptions.delete.method,
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to unsubscribe");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subscriptions.list.path] });
      toast({ title: "Unsubscribed", description: "You won't receive alerts for this route anymore." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
