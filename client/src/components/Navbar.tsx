import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bus, Home, MapPin, Bell, Share2, Menu, Star, Briefcase, Megaphone, BookOpen, Building2 } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { DriverPinDialog } from "@/components/DriverPinDialog";
import { AdminPinDialog } from "@/components/AdminPinDialog";

export function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
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
    { href: "/reviews", label: "Reviews", icon: Star },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/skills", label: "Skills", icon: BookOpen },
    { href: "/advertisements", label: "Sponsors", icon: Megaphone },
  ];
  
  const secondaryLinks = [
    { href: "/advertiser-portal", label: "Advertiser Portal", icon: Building2 },
  ];

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 font-display text-xl font-bold text-primary">
                    <Bus className="h-6 w-6 text-secondary" />
                    MzansiMove
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-8">
                  {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location === link.href;
                    return (
                      <Link key={link.href} href={link.href}>
                        <button 
                          onClick={() => setOpen(false)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                            isActive 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-foreground hover:text-primary hover:bg-muted'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{link.label}</span>
                        </button>
                      </Link>
                    );
                  })}
                  <div className="h-px bg-border my-4" />
                  <button 
                    onClick={() => { handleShare(); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground hover:text-primary hover:bg-muted transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share App</span>
                  </button>
                  <div className="h-px bg-border my-4" />
                  <p className="px-4 text-xs text-muted-foreground uppercase tracking-wide font-semibold">For Advertisers</p>
                  {secondaryLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location === link.href;
                    return (
                      <Link key={link.href} href={link.href}>
                        <button 
                          onClick={() => setOpen(false)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                            isActive 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-foreground hover:text-primary hover:bg-muted'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{link.label}</span>
                        </button>
                      </Link>
                    );
                  })}
                  <div className="mt-2 flex flex-col gap-2" onClick={() => setOpen(false)}>
                    <DriverPinDialog />
                    <AdminPinDialog />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/">
            <div className="flex items-center gap-2 font-display text-xl font-bold text-primary cursor-pointer shrink-0">
              <Bus className="h-6 w-6 text-secondary" />
              <span className="hidden sm:inline">MzansiMove</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 flex-1 justify-center">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link key={link.href} href={link.href}>
                  <button 
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-primary hover:bg-muted'
                    }`}
                    data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <DriverPinDialog />
            <AdminPinDialog />
            <Button onClick={handleShare} variant="ghost" size="icon" data-testid="button-share-global">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
