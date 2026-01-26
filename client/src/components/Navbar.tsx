import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bus, Home, MapPin, Bell, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MzansiMove',
        text: 'Real-time bus schedules and alerts for South Africa.',
        url: window.location.origin,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.origin);
        toast({ title: "Link Copied!", description: "App link copied to clipboard." });
      });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast({ title: "Link Copied!", description: "App link copied to clipboard." });
    }
  };

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/routes", label: "Find My Route", icon: MapPin },
    { href: "/notifications", label: "Alerts", icon: Bell },
  ];

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 font-display text-xl font-bold text-primary cursor-pointer shrink-0">
              <Bus className="h-6 w-6 text-secondary" />
              <span className="hidden sm:inline">MzansiMove</span>
            </div>
          </Link>

          {/* Navigation - Always visible */}
          <nav className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <button 
                    className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-primary hover:bg-muted'
                    }`}
                    data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">{link.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Share Button */}
          <Button onClick={handleShare} variant="ghost" size="icon" className="shrink-0" data-testid="button-share-global">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
