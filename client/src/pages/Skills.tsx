import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Bus, 
  Clock, 
  MapPin, 
  Bell, 
  Star, 
  Smartphone,
  Route,
  AlertTriangle,
  Heart,
  Users,
  Lightbulb,
  BookOpen,
  CheckCircle2
} from "lucide-react";

const tips = [
  {
    icon: Clock,
    title: "Plan Your Journey",
    description: "Check route schedules before leaving. Peak hours (6-9 AM, 4-7 PM) are busiest - plan accordingly.",
    category: "Time Management"
  },
  {
    icon: Bell,
    title: "Subscribe to Alerts",
    description: "Get real-time notifications about delays, cancellations, or service changes on your regular routes.",
    category: "Stay Informed"
  },
  {
    icon: MapPin,
    title: "Know Your Stops",
    description: "Familiarize yourself with major stops along your route. This helps if you need to take alternative transport.",
    category: "Navigation"
  },
  {
    icon: Smartphone,
    title: "Use the App Offline",
    description: "Save your favorite routes to access schedules even without internet connectivity.",
    category: "Tech Tips"
  },
  {
    icon: AlertTriangle,
    title: "Report Issues",
    description: "Help improve service by reporting delays, safety concerns, or other issues through the app.",
    category: "Community"
  },
  {
    icon: Star,
    title: "Leave Reviews",
    description: "Your feedback helps other commuters make informed decisions and improves service quality.",
    category: "Community"
  }
];

const safetyTips = [
  "Keep valuables secure and out of sight",
  "Stay aware of your surroundings at stops",
  "Wait in well-lit areas during early morning or evening",
  "Have your fare ready before boarding",
  "Know the emergency contact numbers",
  "Travel with a charged phone when possible"
];

const transitEtiquette = [
  { tip: "Give up seats for elderly, pregnant, or disabled passengers", icon: Heart },
  { tip: "Keep conversations at a reasonable volume", icon: Users },
  { tip: "Move to the back of the bus to make room", icon: Route },
  { tip: "Have exact fare or tap card ready", icon: CheckCircle2 },
  { tip: "Don't block doorways or aisles", icon: Bus },
  { tip: "Keep food and drink consumption minimal", icon: Lightbulb }
];

export default function SkillsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-10 w-10 text-secondary" />
            <h1 className="font-display text-3xl font-bold text-primary">Commuter Skills Hub</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Master the art of public transport in South Africa. Learn tips, tricks, and best practices 
            to make your daily commute smoother and more enjoyable.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-secondary" />
            Smart Commuting Tips
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tips.map((tip, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <tip.icon className="h-8 w-8 text-secondary" />
                    <Badge variant="outline" className="text-xs">{tip.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Safety First
              </CardTitle>
              <CardDescription>Essential tips to stay safe while commuting</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {safetyTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <span className="text-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Users className="h-5 w-5" />
                Transit Etiquette
              </CardTitle>
              <CardDescription>Be a considerate fellow commuter</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {transitEtiquette.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-foreground">{item.tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/30">
          <CardContent className="py-8 text-center">
            <GraduationCap className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Become a Pro Commuter
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Subscribe to your regular routes and never miss an update. Get personalized alerts 
              and make informed travel decisions every day.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <a href="/routes">Browse Routes</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/subscriptions">My Subscriptions</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
