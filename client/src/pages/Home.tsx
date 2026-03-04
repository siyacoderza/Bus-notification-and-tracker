import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bus, Bell, Star, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRoutes } from "@/hooks/use-routes";
import { RouteCard } from "@/components/RouteCard";
import { DriverPinDialog } from "@/components/DriverPinDialog";
import { AdminPinDialog } from "@/components/AdminPinDialog";
import heroImage from "@/assets/images/hero-transit.png";
import heroCommuters from "@/assets/images/hero-commuters.png";

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const { data: routes, isLoading: isLoadingRoutes } = useRoutes(activeSearch);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image */}
      <div className="relative overflow-hidden text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

        <div className="max-w-7xl mx-auto relative z-10">
          <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-16">
            <div className="flex items-center gap-2 font-display text-2xl font-bold shrink-0">
              <Bus className="h-8 w-8 text-secondary" />
              <span>MzansiMove</span>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-3 items-center">
              <DriverPinDialog variant="light" />
              <AdminPinDialog variant="light" />
            </div>
          </nav>

          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight mb-6 leading-tight">
              Commute with <br />
              <span className="text-secondary">Confidence.</span>
            </h1>
            <p className="text-xl opacity-90 mb-12 font-light max-w-2xl mx-auto">
              Real-time bus schedules and alerts for South Africa. 
              Stay updated with live route information.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pb-[15px]">
        {/* Join the Movement - Moved Up */}
        <div className="relative overflow-hidden rounded-3xl text-white mb-12 shadow-2xl">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroCommuters})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
          <div className="relative z-10 p-8 md:p-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Join the Movement
              </h2>
              <p className="text-lg opacity-90 mb-6">
                Thousands of South African commuters rely on MzansiMove every day. 
                Get real-time updates, share your experiences, and travel smarter together.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/routes">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                    Find Your Route
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/skills">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature Cards */}
          <Link href="/routes">
            <button 
              className="w-full text-left bg-card p-6 rounded-2xl shadow-xl shadow-black/5 border border-border/50 hover-elevate active-elevate-2 transition-all"
              data-testid="card-find-route"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Bus className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Find My Route</h3>
              <p className="text-muted-foreground">Browse routes by municipality to find buses in your area.</p>
            </button>
          </Link>
          <Link href="/notifications">
            <button className="w-full text-left bg-card p-6 rounded-2xl shadow-xl shadow-black/5 border border-border/50 hover-elevate active-elevate-2 transition-all">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary-foreground mb-4">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Live Alerts</h3>
              <p className="text-muted-foreground">Get notified immediately about delays, strikes, or route changes.</p>
            </button>
          </Link>
          <Link href="/reviews">
            <button className="bg-card p-6 rounded-2xl shadow-xl shadow-black/5 border border-border/50 text-left w-full hover:shadow-lg transition-shadow" data-testid="link-route-reviews">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Route Reviews</h3>
              <p className="text-muted-foreground">Hear from fellow commuters and share your own travel experiences.</p>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
