import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBusRoute } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useRoutes(search?: string) {
  return useQuery({
    queryKey: [api.routes.list.path, search],
    queryFn: async () => {
      const url = search 
        ? `${api.routes.list.path}?search=${encodeURIComponent(search)}`
        : api.routes.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch routes");
      return api.routes.list.responses[200].parse(await res.json());
    },
  });
}

export function useIncrementWaiting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/routes/${id}/waiting`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update waiting count");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.routes.list.path] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useRoute(id: number) {
  return useQuery({
    queryKey: [api.routes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.routes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch route");
      return api.routes.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertBusRoute) => {
      const validated = api.routes.create.input.parse(data);
      const res = await fetch(api.routes.create.path, {
        method: api.routes.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.routes.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error('Failed to create route');
      }
      return api.routes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.routes.list.path] });
      toast({ title: "Route Created", description: "New bus route added successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.routes.delete.path, { id });
      const res = await fetch(url, { 
        method: api.routes.delete.method,
        credentials: "include" 
      });
      
      if (!res.ok) {
         if (res.status === 401) throw new Error("Unauthorized");
         throw new Error("Failed to delete route");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.routes.list.path] });
      toast({ title: "Route Deleted", description: "Bus route removed." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
