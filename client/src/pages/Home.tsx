import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/NotificationList";
import { useNotifications } from "@/hooks/use-notifications";
import { ArrowRight, Bus, Bell, Shield } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useNotifications();

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
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2 font-display text-2xl font-bold">
              <Bus className="h-8 w-8 text-secondary" />
              <span>MzansiMove</span>
            </div>
            <div className="flex gap-4">
              {!user ? (
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  variant="secondary" 
                  className="font-bold shadow-lg shadow-black/20"
                >
                  Operator Login
                </Button>
              ) : (
                <Button 
                  onClick={() => window.location.href = "/api/logout"}
                  variant="outline" 
                  className="bg-transparent border-white/30 text-white hover:bg-white/10"
                >
                  Log Out
                </Button>
              )}
            </div>
          </nav>

          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight mb-6 leading-tight">
              Commute with <br />
              <span className="text-secondary">Confidence.</span>
            </h1>
            <p className="text-xl opacity-90 mb-8 font-light">
              Real-time bus schedules and alerts for South Africa. 
              Never miss a connection again with live updates from Putco, Rea Vaya, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/routes">
                <Button size="lg" className="h-14 px-8 text-lg bg-white text-primary hover:bg-secondary hover:text-secondary-foreground transition-colors shadow-xl">
                  Find Your Route <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {user && (
                <Link href="/subscriptions">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-white text-white hover:bg-white/10">
                    My Alerts
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20">
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
              <Button variant="link" className="text-primary font-bold">View All Alerts</Button>
            </Link>
          </div>
          
          <NotificationList notifications={criticalAlerts} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
