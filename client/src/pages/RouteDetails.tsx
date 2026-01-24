import { useRoute } from "@/hooks/use-routes";
import { RouteCard } from "@/components/RouteCard";
import { Loader2, ArrowLeft, Bus } from "lucide-react";
import { Link, useRoute as useWouterRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { RouteChat } from "@/components/RouteChat";

export default function RouteDetails() {
  const [, params] = useWouterRoute("/route/:id");
  const routeId = params?.id ? parseInt(params.id) : -1;
  const { data: routes, isLoading } = useRoute(routeId === -1 ? 0 : routeId);

  // useRoute hook returns a single route object based on the API contract in shared/routes.ts
  const route = routes;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl text-muted-foreground">Route not found</p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-primary text-primary-foreground pt-8 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-8" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Bus className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">{route.name}</h1>
              <p className="text-primary-foreground/80">{route.operatingCompany}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8">
        <RouteCard route={route} showAdminControls={false} />
        <RouteChat routeId={route.id} />
      </div>
    </div>
  );
}
