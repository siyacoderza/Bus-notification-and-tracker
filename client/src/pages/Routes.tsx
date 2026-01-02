import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRoutes } from "@/hooks/use-routes";
import { RouteCard } from "@/components/RouteCard";
import { CreateRouteDialog } from "@/components/CreateRouteDialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function RoutesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data: routes, isLoading } = useRoutes(search);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Bus Schedules</h1>
            <p className="text-muted-foreground mt-1">Browse and subscribe to routes for updates.</p>
          </div>
          
          {user && <CreateRouteDialog />}
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            className="pl-12 h-12 rounded-xl bg-white border-border/60 shadow-sm text-lg"
            placeholder="Search by route name, location, or operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">No routes found matching your search.</p>
              </div>
            ) : (
              routes?.map((route) => (
                <RouteCard key={route.id} route={route} showAdminControls={!!user} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
