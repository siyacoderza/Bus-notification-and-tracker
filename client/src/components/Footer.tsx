import { Bus, Github, Twitter, Mail, MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import heroCommuters from "@/assets/images/hero-commuters.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden text-white py-16 px-4 sm:px-6 lg:px-8">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroCommuters})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Move with <span className="text-secondary">Confidence?</span>
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of South African commuters who trust MzansiMove for real-time transit updates and alerts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/routes">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-footer-find-route">
                Find Your Route
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/notifications">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-footer-alerts">
                View Live Alerts
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-display text-2xl font-bold">
              <Bus className="h-8 w-8 text-secondary" />
              <span>MzansiMove</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Empowering South African commuters with real-time transit intelligence. 
              Move through your city with confidence and clarity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-secondary">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/skills" className="hover:text-secondary transition-colors">Skills</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-secondary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/notifications" className="hover:text-secondary transition-colors">Live Alerts</Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-secondary transition-colors">Find a Route</Link>
              </li>
              <li>
                <Link href="/subscriptions" className="hover:text-secondary transition-colors">My Subscriptions</Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-secondary transition-colors">Career Opportunities</Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-secondary">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-secondary transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">Terms of Service</a>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-secondary transition-colors">Advertise With Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-secondary">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <div className="flex items-start gap-2 text-sm text-primary-foreground/80">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Johannesburg, South Africa</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-primary-foreground/60">
          <p>© {currentYear} MzansiMove. All rights reserved. Proudly South African 🇿🇦</p>
        </div>
      </div>
      </div>
    </footer>
  );
}
