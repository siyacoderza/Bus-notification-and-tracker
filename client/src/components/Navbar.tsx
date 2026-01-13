import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bus, Menu, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

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
            
            {!user ? (
              <Button onClick={() => window.location.href = "/api/login"} size="sm">
                Log In
              </Button>
            ) : (
              <Button onClick={() => window.location.href = "/api/logout"} variant="ghost" size="sm">
                Log Out
              </Button>
            )}
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden">
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
                  {!user ? (
                    <Button onClick={() => window.location.href = "/api/login"}>
                      Log In
                    </Button>
                  ) : (
                    <Button onClick={() => window.location.href = "/api/logout"} variant="outline">
                      Log Out
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
