import { type BusRoute } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bus, Trash2, UserCheck, Loader2 } from "lucide-react";
import { useSubscribe, useUnsubscribe, useSubscriptions } from "@/hooks/use-subscriptions";
import { useAuth } from "@/hooks/use-auth";
import { useDeleteRoute, useIncrementWaiting } from "@/hooks/use-routes";

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
  const incrementWaiting = useIncrementWaiting();

  const isSubscribed = subscriptions?.some(sub => sub.routeId === route.id);
  const isPending = subscribe.isPending || unsubscribe.isPending;

  const handleSubscription = () => {
    if (isSubscribed) {
      unsubscribe.mutate(route.id);
    } else {
      subscribe.mutate(route.id);
    }
  };

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
            {route.waitingCount !== null && route.waitingCount > 0 && (
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                <UserCheck className="h-3 w-3 mr-1" />
                {route.waitingCount} waiting
              </Badge>
            )}
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
        <div className="flex gap-2 w-full">
          <Button 
            onClick={() => incrementWaiting.mutate(route.id)}
            disabled={incrementWaiting.isPending}
            variant="outline"
            className="flex-1 border-primary/30 text-primary hover:bg-primary/5"
            data-testid={`button-waiting-${route.id}`}
          >
            {incrementWaiting.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserCheck className="h-4 w-4 mr-2" />
            )}
            I am waiting
          </Button>

          {user ? (
            <Button 
              onClick={handleSubscription} 
              disabled={isPending}
              variant={isSubscribed ? "outline" : "default"}
              className={`flex-1 transition-all ${isSubscribed ? 'border-primary/50 text-primary hover:bg-primary/5' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'}`}
              data-testid={`button-subscribe-${route.id}`}
            >
              {isSubscribed ? "Subscribed" : "Notify Me"}
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              Log in to Notify
            </Button>
          )}
        </div>

        {showAdminControls && user && (
          <Button 
            variant="destructive" 
            size="sm"
            className="w-full"
            onClick={() => {
              if (confirm('Delete this route? This cannot be undone.')) {
                deleteRoute.mutate(route.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Route
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
