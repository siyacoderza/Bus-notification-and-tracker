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
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Compass,
  Timer,
  Footprints,
  Search,
  MousePointer,
  MessageSquare,
  Briefcase,
  Hand
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

const infographicCourses = [
  {
    title: "Reading Bus Schedules 101",
    icon: BarChart3,
    duration: "5 min read",
    difficulty: "Beginner",
    color: "from-emerald-500 to-teal-600",
    steps: [
      "Find your route number at the top of the schedule",
      "Locate your starting stop in the left column",
      "Read across to find departure times",
      "Check for weekday vs weekend differences",
      "Note any special service indicators"
    ]
  },
  {
    title: "Mastering Route Transfers",
    icon: Route,
    duration: "7 min read",
    difficulty: "Intermediate",
    color: "from-blue-500 to-indigo-600",
    steps: [
      "Identify connection points between routes",
      "Allow 10-15 minutes buffer for transfers",
      "Know alternative routes in case of delays",
      "Use the app to track both buses in real-time",
      "Position yourself near the exit before your stop"
    ]
  },
  {
    title: "Peak Hour Survival Guide",
    icon: Timer,
    duration: "6 min read",
    difficulty: "All Levels",
    color: "from-orange-500 to-red-600",
    steps: [
      "Leave 15-20 minutes earlier than usual",
      "Know which stops have the longest queues",
      "Consider alternative routes with less traffic",
      "Use the 'I'm Waiting' feature to gauge crowds",
      "Have a backup plan ready"
    ]
  },
  {
    title: "First-Time Commuter Guide",
    icon: Footprints,
    duration: "10 min read",
    difficulty: "Beginner",
    color: "from-purple-500 to-pink-600",
    steps: [
      "Download MzansiMove and explore routes",
      "Plan your journey the night before",
      "Arrive at the stop 10 minutes early",
      "Have exact fare or a loaded transport card",
      "Subscribe to your regular routes for alerts",
      "Don't hesitate to ask drivers for help"
    ]
  }
];

const appGuideFeatures = [
  {
    icon: Search,
    title: "Find Your Route",
    description: "Browse routes by province and municipality, or use the global search to find any route instantly.",
    steps: [
      "Go to 'Find My Route' in the menu",
      "Select your province from the dropdown",
      "Choose your municipality",
      "Or use the search bar to find routes by name"
    ],
    link: "/routes"
  },
  {
    icon: Bell,
    title: "Subscribe for Alerts",
    description: "Get notified about delays, cancellations, and service changes on routes you care about.",
    steps: [
      "Find the route you commute on regularly",
      "Click the 'Subscribe' button on the route card",
      "Check the 'Alerts' page for notifications",
      "Manage subscriptions in 'My Subscriptions'"
    ],
    link: "/notifications"
  },
  {
    icon: Hand,
    title: "I'm Waiting Feature",
    description: "Let drivers and other commuters know you're waiting at a stop. Helps drivers prioritize busy stops.",
    steps: [
      "Open any route details page",
      "Click the 'I'm Waiting' button",
      "Your count is added to the waiting total",
      "Drivers can see how many people are waiting"
    ],
    link: "/routes"
  },
  {
    icon: Star,
    title: "Leave a Review",
    description: "Share your experience and help other commuters make informed decisions.",
    steps: [
      "Go to the 'Reviews' page",
      "Select the route you want to review",
      "Rate your experience (1-5 stars)",
      "Add optional comments about the service"
    ],
    link: "/reviews"
  },
  {
    icon: Briefcase,
    title: "Find Transport Jobs",
    description: "Explore career opportunities in the South African transport industry.",
    steps: [
      "Navigate to the 'Jobs' page",
      "Browse available positions",
      "Click on a job for full details",
      "Apply using the contact information provided"
    ],
    link: "/jobs"
  },
  {
    icon: MessageSquare,
    title: "Advertise With Us",
    description: "Promote your business to thousands of daily commuters through route sponsorships.",
    steps: [
      "Visit the 'Advertise With Us' page",
      "Fill out the application form",
      "Select your target routes",
      "Wait for admin approval to go live"
    ],
    link: "/advertise"
  }
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
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-secondary/20 p-2 rounded-lg">
              <Smartphone className="h-6 w-6 text-secondary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">How to Use MzansiMove</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Get the most out of the app with our quick feature guides. Learn how to find routes, subscribe to alerts, and more.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appGuideFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <ol className="space-y-2">
                    {feature.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary/20 text-secondary text-xs font-bold shrink-0">
                          {stepIndex + 1}
                        </span>
                        <span className="text-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <a href={feature.link}>
                      Try It Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

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

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Compass className="h-6 w-6 text-secondary" />
            Infographic Courses
          </h2>
          <p className="text-muted-foreground mb-6">
            Step-by-step visual guides to help you become a confident commuter. Each course breaks down essential skills into easy-to-follow steps.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {infographicCourses.map((course, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`bg-gradient-to-r ${course.color} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <course.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-white">{course.title}</h3>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge className="bg-white/20 text-white border-0 text-xs">{course.duration}</Badge>
                    <Badge className="bg-white/20 text-white border-0 text-xs">{course.difficulty}</Badge>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <ol className="space-y-3">
                    {course.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r ${course.color} text-white text-xs font-bold shrink-0`}>
                          {stepIndex + 1}
                        </span>
                        <span className="text-sm text-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
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
