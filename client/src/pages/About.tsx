import { Bus, Users, MapPin, Clock, Shield, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bus className="h-12 w-12 text-secondary" />
            <h1 className="font-display text-4xl font-bold text-primary">MzansiMove</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering South African commuters with real-time transit intelligence
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              MzansiMove was created to solve the everyday challenges faced by South African commuters. 
              We believe that everyone deserves access to reliable, real-time information about public 
              transportation. Our platform connects passengers with bus operators, providing live updates 
              on routes, schedules, and service alerts.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 flex gap-4">
                  <MapPin className="h-8 w-8 text-secondary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Route Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Find and track bus routes across South African cities with real-time updates.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex gap-4">
                  <Clock className="h-8 w-8 text-secondary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Live Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Get instant notifications about delays, cancellations, and service changes.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex gap-4">
                  <Users className="h-8 w-8 text-secondary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Community Reviews</h3>
                    <p className="text-sm text-muted-foreground">
                      Share and read honest reviews from fellow commuters about routes and services.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 flex gap-4">
                  <Shield className="h-8 w-8 text-secondary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Privacy First</h3>
                    <p className="text-sm text-muted-foreground">
                      No personal data required for basic features. Your privacy is our priority.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Born in Mzansi (South Africa), MzansiMove understands the unique challenges of public 
              transportation in our country. From the bustling streets of Johannesburg to the scenic 
              routes of Cape Town, we're committed to making commuting easier for all South Africans.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We work closely with bus operators, drivers, and commuters to continuously improve our 
              platform. Whether you're a daily commuter, occasional traveler, or a transport company 
              looking to reach more passengers, MzansiMove is here to help.
            </p>
          </section>

          <section className="bg-primary/5 rounded-xl p-8 text-center">
            <Heart className="h-10 w-10 text-secondary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Proudly South African
            </h2>
            <p className="text-muted-foreground">
              Built with love for our communities, by South Africans, for South Africans.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
