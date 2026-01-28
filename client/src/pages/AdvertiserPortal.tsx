import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Megaphone, Building2, Mail, Lock, BarChart3, PlusCircle, Edit2, Eye, EyeOff, 
  LogOut, Loader2, TrendingUp, Users, MousePointerClick, Calendar, Route 
} from "lucide-react";
import { format } from "date-fns";
import type { Advertisement, BusRoute } from "@shared/schema";

type RouteAnalyticsWithName = {
  id: number;
  routeId: number;
  date: string;
  dailyPassengers: number;
  peakHourPassengers: number;
  averageWaitTime: number | null;
  impressions: number;
  clicks: number;
  routeName: string;
};

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  pin: z.string().min(4, "PIN must be at least 4 digits"),
});

const adFormSchema = z.object({
  sponsorName: z.string().min(2, "Sponsor name is required"),
  message: z.string().min(2, "Message is required"),
  sponsorLogo: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  placementType: z.enum(["standard", "premium", "exclusive"]),
  routeIds: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isActive: z.boolean(),
});

export default function AdvertiserPortal() {
  const { toast } = useToast();
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery<{
    isAdvertiser: boolean;
    advertiserId?: number;
    companyName?: string;
  }>({
    queryKey: ["/api/advertiser-status"],
  });

  const isLoggedIn = statusData?.isAdvertiser;

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginForm onSuccess={refetchStatus} />;
  }

  return (
    <AdvertiserDashboard 
      companyName={statusData?.companyName || "Advertiser"} 
      onLogout={refetchStatus}
      editingAd={editingAd}
      setEditingAd={setEditingAd}
      showCreateForm={showCreateForm}
      setShowCreateForm={setShowCreateForm}
    />
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", pin: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const res = await apiRequest("POST", "/api/verify-advertiser-pin", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Welcome back!" });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground">Advertiser Portal</h1>
          <p className="text-muted-foreground mt-2">
            Log in to manage your advertisements and view analytics
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your registered email and PIN
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="you@company.com" 
                            className="pl-10" 
                            {...field} 
                            data-testid="input-advertiser-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="Your PIN" 
                            className="pl-10" 
                            {...field}
                            data-testid="input-advertiser-pin"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                  data-testid="button-advertiser-login"
                >
                  {loginMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Don't have an account?</p>
              <a href="/advertise" className="text-primary hover:underline">
                Apply to become an advertiser
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdvertiserDashboard({ 
  companyName, 
  onLogout,
  editingAd,
  setEditingAd,
  showCreateForm,
  setShowCreateForm
}: { 
  companyName: string; 
  onLogout: () => void;
  editingAd: Advertisement | null;
  setEditingAd: (ad: Advertisement | null) => void;
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
}) {
  const { toast } = useToast();

  const { data: myAds = [], isLoading: adsLoading } = useQuery<Advertisement[]>({
    queryKey: ["/api/advertiser/my-ads"],
  });

  const { data: routes = [] } = useQuery<BusRoute[]>({
    queryKey: ["/api/routes"],
  });

  const { data: analytics = [] } = useQuery<RouteAnalyticsWithName[]>({
    queryKey: ["/api/route-analytics"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/exit-advertiser-mode");
    },
    onSuccess: () => {
      toast({ title: "Logged out successfully" });
      onLogout();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {companyName}
            </h1>
            <p className="text-muted-foreground">Advertiser Dashboard</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => logoutMutation.mutate()}
            data-testid="button-advertiser-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ads" data-testid="tab-my-ads">
              <Megaphone className="h-4 w-4 mr-2" />
              My Ads
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Route Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ads">
            {showCreateForm || editingAd ? (
              <AdForm 
                ad={editingAd}
                routes={routes}
                onCancel={() => {
                  setShowCreateForm(false);
                  setEditingAd(null);
                }}
                onSuccess={() => {
                  setShowCreateForm(false);
                  setEditingAd(null);
                }}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Your Advertisements</h2>
                  <Button onClick={() => setShowCreateForm(true)} data-testid="button-create-ad">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Ad
                  </Button>
                </div>

                {adsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : myAds.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-lg mb-2">No Advertisements Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first ad to start reaching commuters
                      </p>
                      <Button onClick={() => setShowCreateForm(true)}>
                        Create Your First Ad
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {myAds.map((ad) => (
                      <AdCard 
                        key={ad.id} 
                        ad={ad} 
                        routes={routes}
                        onEdit={() => setEditingAd(ad)} 
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsView analytics={analytics} routes={routes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdCard({ 
  ad, 
  routes,
  onEdit 
}: { 
  ad: Advertisement; 
  routes: BusRoute[];
  onEdit: () => void;
}) {
  const now = new Date();
  const startDate = new Date(ad.startDate);
  const endDate = new Date(ad.endDate);
  const isExpired = endDate <= now;
  
  const approvalStatus = (ad as any).approvalStatus || "pending";
  const approvalReason = (ad as any).approvalReason;
  
  const getStatusBadge = () => {
    if (approvalStatus === "pending") {
      return <Badge className="bg-yellow-500">Pending Approval</Badge>;
    }
    if (approvalStatus === "rejected") {
      return <Badge className="bg-red-500">Rejected</Badge>;
    }
    if (approvalStatus === "approved") {
      if (isExpired) {
        return <Badge variant="outline">Expired</Badge>;
      }
      if (!ad.isActive) {
        return <Badge variant="outline">Paused</Badge>;
      }
      if (startDate > now) {
        return <Badge variant="secondary">Scheduled</Badge>;
      }
      return <Badge className="bg-green-500">Active</Badge>;
    }
    return null;
  };

  const targetRoutes = ad.routeIds && ad.routeIds.length > 0
    ? routes.filter(r => ad.routeIds?.includes(r.id)).map(r => r.name).join(", ")
    : "All Routes";

  return (
    <Card data-testid={`card-ad-${ad.id}`}>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold truncate">{ad.sponsorName}</h3>
              {getStatusBadge()}
            </div>
            
            {ad.message && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{ad.message}</p>
            )}
            
            {approvalStatus === "rejected" && approvalReason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-2">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Rejection reason:</strong> {approvalReason}
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Route className="h-4 w-4" />
                {targetRoutes}
              </span>
              <Badge variant="outline">{ad.placementType}</Badge>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onEdit} data-testid={`button-edit-ad-${ad.id}`}>
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AdForm({ 
  ad, 
  routes,
  onCancel, 
  onSuccess 
}: { 
  ad: Advertisement | null;
  routes: BusRoute[];
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEditing = !!ad;

  const form = useForm<z.infer<typeof adFormSchema>>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      sponsorName: ad?.sponsorName || "",
      message: ad?.message || "",
      sponsorLogo: ad?.sponsorLogo || "",
      linkUrl: ad?.linkUrl || "",
      placementType: ad?.placementType as "standard" | "premium" | "exclusive" || "standard",
      routeIds: ad?.routeIds?.join(",") || "",
      startDate: ad?.startDate ? format(new Date(ad.startDate), "yyyy-MM-dd") : "",
      endDate: ad?.endDate ? format(new Date(ad.endDate), "yyyy-MM-dd") : "",
      isActive: ad?.isActive ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof adFormSchema>) => {
      const payload = {
        ...data,
        routeIds: data.routeIds ? data.routeIds.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [],
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };

      if (isEditing) {
        const res = await apiRequest("PATCH", `/api/advertiser/my-ads/${ad!.id}`, payload);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/advertiser/my-ads", payload);
        return res.json();
      }
    },
    onSuccess: () => {
      toast({ title: isEditing ? "Ad updated!" : "Ad created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/advertiser/my-ads"] });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to save ad", variant: "destructive" });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Advertisement" : "Create New Advertisement"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update your advertisement details" : "Fill in the details for your new ad"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="sponsorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsor Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Company or brand name" {...field} data-testid="input-ad-sponsor" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Message *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Your promotional message"
                      className="resize-none"
                      {...field} 
                      data-testid="input-ad-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sponsorLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} data-testid="input-ad-logo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yoursite.com" {...field} data-testid="input-ad-link" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="placementType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placement Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-placement-type">
                        <SelectValue placeholder="Select placement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="sponsored">Sponsored</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="routeIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Route IDs (comma-separated, leave empty for all)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 1, 2, 3" 
                      {...field} 
                      data-testid="input-ad-routes"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Available routes: {routes.map(r => `${r.id}: ${r.name}`).join(", ") || "No routes available"}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-ad-start-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-ad-end-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Enable this ad to start showing when dates are valid
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-ad-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-ad">
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Ad"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function AnalyticsView({ 
  analytics, 
  routes 
}: { 
  analytics: RouteAnalyticsWithName[];
  routes: BusRoute[];
}) {
  const totalPassengers = analytics.reduce((sum, a) => sum + a.dailyPassengers, 0);
  const totalImpressions = analytics.reduce((sum, a) => sum + a.impressions, 0);
  const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Route Traffic Analytics</h2>
        <p className="text-muted-foreground mb-6">
          Use this data to decide which routes to target with your advertisements
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalPassengers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Ad Impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MousePointerClick className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Ad Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{avgCtr}%</p>
                <p className="text-sm text-muted-foreground">Click-Through Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Performance</CardTitle>
          <CardDescription>Latest analytics by route (based on recent data)</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No analytics data available yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Route</th>
                    <th className="text-right py-3 px-2 font-medium">Daily Passengers</th>
                    <th className="text-right py-3 px-2 font-medium">Peak Hour</th>
                    <th className="text-right py-3 px-2 font-medium">Avg Wait</th>
                    <th className="text-right py-3 px-2 font-medium">Impressions</th>
                    <th className="text-right py-3 px-2 font-medium">Clicks</th>
                    <th className="text-right py-3 px-2 font-medium">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((a) => {
                    const ctr = a.impressions > 0 ? ((a.clicks / a.impressions) * 100).toFixed(2) : "0.00";
                    return (
                      <tr key={a.id} className="border-b" data-testid={`row-analytics-${a.routeId}`}>
                        <td className="py-3 px-2 font-medium">{a.routeName}</td>
                        <td className="py-3 px-2 text-right">{a.dailyPassengers.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">{a.peakHourPassengers.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">{a.averageWaitTime ?? "-"} min</td>
                        <td className="py-3 px-2 text-right">{a.impressions.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">{a.clicks.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right text-green-600">{ctr}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
