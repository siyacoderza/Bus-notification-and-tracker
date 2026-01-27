import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAdvertisements, useDeleteAdvertisement } from "@/hooks/use-advertisements";
import { useAdminMode } from "@/hooks/use-admin-mode";
import { useAdvertiserApplications, useUpdateApplicationStatus, useDeleteAdvertiserApplication } from "@/hooks/use-advertiser-applications";
import { CreateAdvertisementDialog } from "@/components/CreateAdvertisementDialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, Building2, ExternalLink, Calendar, Loader2, Trash2, DollarSign, MapPin, CalendarX, FileText, Mail, Phone, Globe, Clock, CheckCircle2, XCircle, MessageCircle } from "lucide-react";
import { format, isPast, isFuture } from "date-fns";
import { type Advertisement, type AdvertiserApplication } from "@shared/schema";
import { Link } from "wouter";

function AdCard({ ad, isAdmin }: { ad: Advertisement; isAdmin: boolean }) {
  const deleteAd = useDeleteAdvertisement();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      deleteAd.mutate(ad.id);
    }
  };

  const isExpired = isPast(new Date(ad.endDate));
  const isUpcoming = isFuture(new Date(ad.startDate));
  const isActive = !isExpired && !isUpcoming && ad.isActive;

  const placementColors: Record<string, string> = {
    "standard": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    "premium": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    "exclusive": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 relative overflow-hidden ${isExpired ? 'opacity-60' : ''}`} data-testid={`ad-card-${ad.id}`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${isExpired ? 'bg-gradient-to-b from-destructive to-destructive/50' : isActive ? 'bg-gradient-to-b from-green-500 to-green-300' : 'bg-gradient-to-b from-yellow-500 to-yellow-300'} group-hover:w-2 transition-all duration-300`} />
      
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div className="flex flex-wrap gap-1">
            <Badge className={placementColors[ad.placementType || "standard"]}>
              {(ad.placementType || "standard").charAt(0).toUpperCase() + (ad.placementType || "standard").slice(1)}
            </Badge>
            {isActive && (
              <Badge variant="default" className="bg-green-600">
                Active
              </Badge>
            )}
            {isExpired && (
              <Badge variant="destructive">
                <CalendarX className="h-3 w-3 mr-1" />
                Expired
              </Badge>
            )}
            {isUpcoming && (
              <Badge variant="secondary">
                <Calendar className="h-3 w-3 mr-1" />
                Upcoming
              </Badge>
            )}
          </div>
          {ad.pricePerMonth && (
            <Badge variant="outline" className="font-mono text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              R{(ad.pricePerMonth / 100).toLocaleString()}/mo
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-display text-primary mt-2 flex items-center gap-2">
          {ad.sponsorLogo && (
            <img src={ad.sponsorLogo} alt={ad.sponsorName} className="h-8 w-8 object-contain rounded" />
          )}
          {ad.sponsorName}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {ad.message}
        </p>

        {ad.linkUrl && (
          <a 
            href={ad.linkUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Visit Sponsor
          </a>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(ad.startDate), "dd MMM yyyy")} - {format(new Date(ad.endDate), "dd MMM yyyy")}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {ad.routeIds && ad.routeIds.length > 0 
            ? `${ad.routeIds.length} selected route${ad.routeIds.length > 1 ? 's' : ''}`
            : 'All routes (network-wide)'
          }
        </div>
      </CardContent>

      {isAdmin && (
        <CardFooter>
          <Button 
            variant="destructive" 
            size="sm"
            className="w-full"
            onClick={handleDelete}
            disabled={deleteAd.isPending}
            data-testid={`button-delete-ad-${ad.id}`}
          >
            {deleteAd.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Ad
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function ApplicationCard({ app }: { app: AdvertiserApplication }) {
  const updateStatus = useUpdateApplicationStatus();
  const deleteApp = useDeleteAdvertiserApplication();

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    contacted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  };

  const statusIcon: Record<string, typeof CheckCircle2> = {
    pending: Clock,
    contacted: MessageCircle,
    approved: CheckCircle2,
    rejected: XCircle,
  };

  const StatusIcon = statusIcon[app.status || "pending"] || Clock;

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate({ id: app.id, status: newStatus });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this application?")) {
      deleteApp.mutate(app.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300" data-testid={`app-card-${app.id}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <Badge className={statusColors[app.status || "pending"]}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {(app.status || "pending").charAt(0).toUpperCase() + (app.status || "pending").slice(1)}
          </Badge>
          <Badge variant="outline">
            {app.placementType.charAt(0).toUpperCase() + app.placementType.slice(1)}
          </Badge>
        </div>
        <CardTitle className="text-lg font-display text-primary mt-2">
          {app.companyName}
        </CardTitle>
        <CardDescription>{app.contactName}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <a href={`mailto:${app.email}`} className="hover:text-primary">{app.email}</a>
        </div>
        {app.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <a href={`tel:${app.phone}`} className="hover:text-primary">{app.phone}</a>
          </div>
        )}
        {app.website && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <a href={app.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
              {app.website}
            </a>
          </div>
        )}
        {app.budget && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            {app.budget}
          </div>
        )}
        {app.targetRoutes && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {app.targetRoutes}
          </div>
        )}
        {app.campaignGoals && (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
            <strong>Goals:</strong> {app.campaignGoals}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2">
          <Clock className="h-3 w-3" />
          Applied {format(new Date(app.createdAt!), "dd MMM yyyy")}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2 w-full">
          {(app.status === "pending" || !app.status) && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStatusChange("contacted")}
                disabled={updateStatus.isPending}
                data-testid={`button-contact-${app.id}`}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Contacted
              </Button>
              <Button 
                size="sm" 
                variant="default"
                onClick={() => handleStatusChange("approved")}
                disabled={updateStatus.isPending}
                data-testid={`button-approve-${app.id}`}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleStatusChange("rejected")}
                disabled={updateStatus.isPending}
                data-testid={`button-reject-${app.id}`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {app.status === "contacted" && (
            <>
              <Button 
                size="sm" 
                variant="default"
                onClick={() => handleStatusChange("approved")}
                disabled={updateStatus.isPending}
                data-testid={`button-approve-${app.id}`}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleStatusChange("rejected")}
                disabled={updateStatus.isPending}
                data-testid={`button-reject-${app.id}`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full text-muted-foreground"
          onClick={handleDelete}
          disabled={deleteApp.isPending}
          data-testid={`button-delete-app-${app.id}`}
        >
          {deleteApp.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AdvertisementsPage() {
  const { isAdmin } = useAdminMode();
  const { data: ads, isLoading } = useAdvertisements(!isAdmin);
  const { data: applications, isLoading: appsLoading } = useAdvertiserApplications();
  const pendingCount = applications?.filter(a => a.status === "pending" || !a.status).length || 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Megaphone className="h-8 w-8 text-secondary" />
              Sponsored Routes
            </h1>
            <p className="text-muted-foreground mt-1">
              Partner with brands to advertise on MzansiMove bus routes.
            </p>
          </div>
          
          {isAdmin && <CreateAdvertisementDialog />}
        </div>

        {!isAdmin && (
          <Card className="mb-8 bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
            <CardContent className="py-6">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Advertise on MzansiMove
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Reach thousands of daily commuters by sponsoring bus routes. Our advertising packages include:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-background rounded-lg p-3">
                  <Badge className="bg-blue-100 text-blue-800 mb-2">Standard</Badge>
                  <p className="font-bold">R500 - R2,000/month</p>
                  <p className="text-muted-foreground text-xs">Per-route sponsorship</p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <Badge className="bg-purple-100 text-purple-800 mb-2">Premium</Badge>
                  <p className="font-bold">R3,000 - R5,000/month</p>
                  <p className="text-muted-foreground text-xs">Featured route placement</p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <Badge className="bg-amber-100 text-amber-800 mb-2">Exclusive</Badge>
                  <p className="font-bold">R8,000 - R15,000/month</p>
                  <p className="text-muted-foreground text-xs">Network-wide coverage</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link href="/advertise">
                  <Button data-testid="button-apply-advertise">
                    <FileText className="h-4 w-4 mr-2" />
                    Apply to Advertise
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {isAdmin ? (
          <Tabs defaultValue="ads" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="ads" data-testid="tab-ads">
                Active Ads
              </TabsTrigger>
              <TabsTrigger value="applications" data-testid="tab-applications" className="relative">
                Applications
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ads">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : ads && ads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ads.map((ad) => (
                    <AdCard key={ad.id} ad={ad} isAdmin={isAdmin} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">No Advertisements</h2>
                  <p className="text-muted-foreground">
                    Create your first sponsored route advertisement to start generating revenue.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="applications">
              {appsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {applications.map((app) => (
                    <ApplicationCard key={app.id} app={app} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">No Applications</h2>
                  <p className="text-muted-foreground">
                    New advertiser applications will appear here.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : ads && ads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} isAdmin={isAdmin} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Megaphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">No Active Advertisements</h2>
                <p className="text-muted-foreground">
                  Contact us to become a sponsor and reach thousands of daily commuters.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
