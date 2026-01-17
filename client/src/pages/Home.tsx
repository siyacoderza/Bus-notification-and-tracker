import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/NotificationList";
import { useNotifications } from "@/hooks/use-notifications";
import { ArrowRight, Bus, Bell, Shield, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRoutes } from "@/hooks/use-routes";
import { RouteCard } from "@/components/RouteCard";

export default function Home() {
  const { user } = useAuth();
  const { data: notifications, isLoading: isLoadingNotifications } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const { data: routes, isLoading: isLoadingRoutes } = useRoutes(activeSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
  };

  // Filter for critical alerts on homepage
  const criticalAlerts = notifications?.filter(n => 
    ['delay', 'cancellation', 'emergency'].includes(n.type)
  ).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-primary text-primary-foreground pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          {/* Abstract Pattern */}
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-secondary blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-16">
            <div className="flex items-center gap-2 font-display text-2xl font-bold shrink-0">
              <Bus className="h-8 w-8 text-secondary" />
              <span>MzansiMove</span>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-3 items-center">
              {user && (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm shrink-0">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-sm font-medium">{user.role === 'admin' ? 'Administrator' : 'Passenger'}</span>
                </div>
              )}
              <div className="flex gap-2">
                {!user ? (
                  <Button 
                    onClick={() => window.location.href = `${window.location.origin}/api/login`}
                    variant="secondary" 
                    className="font-bold shadow-lg shadow-black/20"
                    data-testid="button-operator-login"
                  >
                    Operator Login
                  </Button>
                ) : (
                  <Button 
                    onClick={() => window.location.href = `${window.location.origin}/api/logout`}
                    variant="outline" 
                    className="bg-transparent border-white/30 text-white hover:bg-white/10"
                    data-testid="button-logout"
                  >
                    Log Out
                  </Button>
                )}
              </div>
            </div>
          </nav>

          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight mb-6 leading-tight">
              Commute with <br />
              <span className="text-secondary">Confidence.</span>
            </h1>
            <p className="text-xl opacity-90 mb-12 font-light max-w-2xl mx-auto">
              Real-time bus schedules and alerts for South Africa. 
              Search for your route to get live updates.
            </p>
            
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="text"
                  placeholder="Where are you going? (e.g., Soweto, Sandton)"
                  className="h-16 pl-12 pr-32 text-lg rounded-2xl bg-white/95 text-foreground border-0 shadow-2xl focus-visible:ring-2 focus-visible:ring-secondary transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-route-search"
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  data-testid="button-search-submit"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pb-20">
        {/* Search Results Section */}
        {activeSearch && (
          <div className="mb-12">
            <div className="bg-white rounded-3xl p-8 border border-border/60 shadow-lg mb-8">
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                <Search className="h-6 w-6 text-primary" />
                Search Results for "{activeSearch}"
              </h2>
              
              {isLoadingRoutes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : routes && routes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {routes
                    .sort((a, b) => {
                      const aPinned = user?.pinnedRoutes?.includes(a.id);
                      const bPinned = user?.pinnedRoutes?.includes(b.id);
                      if (aPinned && !bPinned) return -1;
                      if (!aPinned && bPinned) return 1;
                      return 0;
                    })
                    .map((route) => (
                      <RouteCard key={route.id} route={route} showAdminControls={user?.role === 'admin'} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No routes found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature Cards */}
          <div className="bg-card p-6 rounded-2xl shadow-xl shadow-black/5 border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Bus className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Live Schedules</h3>
            <p className="text-muted-foreground">Up-to-date departure times for all major routes across the metro.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-xl shadow-black/5 border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary-foreground mb-4">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Instant Alerts</h3>
            <p className="text-muted-foreground">Get notified immediately about delays, strikes, or route changes.</p>
          </div>
          <div className="bg-card p-6 rounded-2xl shadow-xl shadow-black/5 border border-border/50">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Verified Info</h3>
            <p className="text-muted-foreground">Updates sourced directly from official operators and transport authorities.</p>
          </div>
        </div>

        {/* Critical Alerts Section */}
        <div className="bg-white rounded-3xl p-8 border border-border/60 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold flex items-center gap-2">
              <span className="w-2 h-8 rounded-full bg-destructive inline-block" />
              Live Incidents
            </h2>
            <Link href="/notifications">
              <Button variant="ghost" className="text-primary font-bold" data-testid="link-view-all-alerts">View All Alerts</Button>
            </Link>
          </div>
          
          <NotificationList notifications={criticalAlerts} loading={isLoadingNotifications} />
        </div>
      </div>
    </div>
  );
}
