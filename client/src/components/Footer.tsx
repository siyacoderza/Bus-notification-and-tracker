import { Bus, Github, Twitter, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";
import heroImage from "@/assets/images/hero-transit.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80" />
      
      <div className="relative z-10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-display text-2xl font-bold">
              <Bus className="h-8 w-8 text-secondary" />
              <span>MzansiMove</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Empowering South African commuters with real-time transit intelligence. 
              Move through your city with confidence and clarity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-secondary">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/80">
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
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="https://wa.me/27641037980" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Us (WhatsApp)
                </a>
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
            <div className="flex items-start gap-2 text-sm text-white/80">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Johannesburg, South Africa</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center text-sm text-white/60">
          <p>© {currentYear} MzansiMove. All rights reserved. Proudly South African 🇿🇦</p>
        </div>
      </div>
      </div>
    </footer>
  );
}
