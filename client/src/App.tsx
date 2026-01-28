import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import RouteDetails from "@/pages/RouteDetails";
import RoutesPage from "@/pages/Routes";
import NotificationsPage from "@/pages/Notifications";
import SubscriptionsPage from "@/pages/Subscriptions";
import ReviewsPage from "@/pages/Reviews";
import JobsPage from "@/pages/Jobs";
import AdvertisementsPage from "@/pages/Advertisements";
import AboutPage from "@/pages/About";
import AdvertisePage from "@/pages/Advertise";
import SkillsPage from "@/pages/Skills";
import AdvertiserPortalPage from "@/pages/AdvertiserPortal";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";

import AuthPage from "@/pages/AuthPage";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/route/:id" component={RouteDetails} />
          <Route path="/routes" component={RoutesPage} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/subscriptions" component={SubscriptionsPage} />
          <Route path="/reviews" component={ReviewsPage} />
          <Route path="/jobs" component={JobsPage} />
          <Route path="/advertisements" component={AdvertisementsPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/advertise" component={AdvertisePage} />
          <Route path="/skills" component={SkillsPage} />
          <Route path="/advertiser-portal" component={AdvertiserPortalPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
