import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bus, Menu, X, Share2 } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

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
    { href: "/routes", label: "Routes" },
    { href: "/notifications", label: "Alerts" },
    ...(user ? [{ href: "/subscriptions", label: "My Routes" }] : []),
  ];

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/">
            <div className="flex items-center gap-2 font-display text-xl font-bold text-primary cursor-pointer">
              <Bus className="h-6 w-6 text-secondary" />
              <span>MzansiMove</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={`cursor-pointer text-sm font-medium transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-muted-foreground'}`}>
                  {link.label}
                </span>
              </Link>
            ))}
            
            <Button onClick={handleShare} variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>

            {/* Login disabled by request */}
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-2">
            <Button onClick={handleShare} variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 mt-10">
                  {links.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <span 
                        onClick={() => setOpen(false)}
                        className={`text-lg font-medium ${location === link.href ? 'text-primary' : 'text-foreground'}`}
                      >
                        {link.label}
                      </span>
                    </Link>
                  ))}
                  
                  <div className="h-px bg-border my-2" />
                  
                  {/* Login disabled by request */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
