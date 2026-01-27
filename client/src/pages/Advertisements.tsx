import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAdvertisements, useDeleteAdvertisement } from "@/hooks/use-advertisements";
import { useAdminMode } from "@/hooks/use-admin-mode";
import { CreateAdvertisementDialog } from "@/components/CreateAdvertisementDialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Building2, ExternalLink, Calendar, Loader2, Trash2, DollarSign, MapPin, CalendarX } from "lucide-react";
import { format, isPast, isFuture } from "date-fns";
import { type Advertisement } from "@shared/schema";

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

export default function AdvertisementsPage() {
  const { isAdmin } = useAdminMode();
  const { data: ads, isLoading } = useAdvertisements(!isAdmin);

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
            </CardContent>
          </Card>
        )}

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
              {isAdmin 
                ? "Create your first sponsored route advertisement to start generating revenue."
                : "Contact us to become a sponsor and reach thousands of daily commuters."
              }
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
