import { type BusRoute } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bus, Trash2, Users, Loader2 } from "lucide-react";
import { useSubscribe, useUnsubscribe, useSubscriptions } from "@/hooks/use-subscriptions";
import { useAuth } from "@/hooks/use-auth";
import { useDeleteRoute } from "@/hooks/use-routes";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface RouteCardProps {
  route: BusRoute;
  showAdminControls?: boolean;
}

export function RouteCard({ route, showAdminControls = false }: RouteCardProps) {
  const { user } = useAuth();
  const { data: subscriptions } = useSubscriptions();
  const subscribe = useSubscribe();
  const unsubscribe = useUnsubscribe();
  const deleteRoute = useDeleteRoute();

  const isSubscribed = subscriptions?.some(sub => sub.routeId === route.id);
  const isPending = subscribe.isPending || unsubscribe.isPending;

  const handleSubscription = () => {
    if (isSubscribed) {
      unsubscribe.mutate(route.id);
    } else {
      subscribe.mutate(route.id);
    }
  };

  const isOperator = user?.role === 'operator';
  const waitingCount = route.waitingCount || 0;

  const incrementWaiting = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/routes/${route.id}/wait`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
    },
  });

  return (
    <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden bg-white/50 backdrop-blur-sm">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50 group-hover:w-2 transition-all duration-300" />
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <Badge variant={route.isActive ? "outline" : "destructive"} className="mb-2">
            {route.isActive ? "Active Service" : "Service Suspended"}
          </Badge>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground font-bold">
              {route.operatingCompany}
            </Badge>
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
              <Users className="h-3 w-3" />
              <span>{waitingCount} waiting</span>
            </div>
          </div>
        </div>
        <CardTitle className="text-xl font-display text-primary">{route.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">{route.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-foreground/80 bg-muted/50 p-3 rounded-lg">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium">{route.startLocation}</span>
          <span className="text-muted-foreground px-2">→</span>
          <span className="font-medium">{route.endLocation}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <Button 
            onClick={() => incrementWaiting.mutate()}
            disabled={incrementWaiting.isPending}
            variant="outline"
            className="w-full border-primary/50 text-primary hover:bg-primary/5 shadow-sm"
            data-testid={`button-wait-route-${route.id}`}
          >
            {incrementWaiting.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Users className="h-4 w-4 mr-2" />
            )}
            <span className="truncate">I'm Waiting</span>
          </Button>

          {user && !isOperator && (
            <Button 
              onClick={handleSubscription} 
              disabled={isPending}
              variant={isSubscribed ? "outline" : "default"}
              className={`w-full transition-all ${isSubscribed ? 'border-primary/50 text-primary hover:bg-primary/5' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'}`}
            >
              <span className="truncate">{isSubscribed ? "Subscribed" : "Subscribe for Alerts"}</span>
            </Button>
          )}
        </div>

        {!user && (
          <p className="text-[10px] text-muted-foreground text-center w-full">
            Log in to receive notifications for this route
          </p>
        )}

        {isOperator && (
          <div className="w-full text-sm font-medium text-center text-muted-foreground p-2 bg-muted/30 rounded-lg">
            Status Management Mode
          </div>
        )}

        {showAdminControls && user?.role === 'admin' && (
          <Button 
            variant="destructive" 
            size="icon"
            className="absolute bottom-4 right-4"
            onClick={() => {
              if (confirm('Delete this route? This cannot be undone.')) {
                deleteRoute.mutate(route.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
