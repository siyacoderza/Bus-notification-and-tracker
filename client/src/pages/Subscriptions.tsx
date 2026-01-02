import { useAuth } from "@/hooks/use-auth";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { RouteCard } from "@/components/RouteCard";
import { Navbar } from "@/components/Navbar";
import { Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function SubscriptionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions();

  if (authLoading) return null;

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <Heart className="h-8 w-8 text-destructive fill-destructive/20" />
            My Routes
          </h1>
          <p className="text-muted-foreground mt-1">Routes you are following for priority updates.</p>
        </div>

        {subsLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {subscriptions?.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-border">
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-bold mb-2">No Subscriptions Yet</h3>
                  <p className="text-muted-foreground mb-6">Subscribe to your daily routes to get instant notifications about delays.</p>
                  <Link href="/routes">
                    <Button>Browse Routes</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions?.map((sub) => (
                  <RouteCard key={sub.route.id} route={sub.route} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
