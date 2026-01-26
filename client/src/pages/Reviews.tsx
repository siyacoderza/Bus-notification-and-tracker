import { useQuery } from "@tanstack/react-query";
import { Review, User, BusRoute } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2, Bus, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

type ReviewWithRouteAndUser = Review & { user: User; route: BusRoute };

export default function ReviewsPage() {
  const { data: reviews, isLoading } = useQuery<ReviewWithRouteAndUser[]>({
    queryKey: ["/api/reviews"],
  });

  const reviewsByRoute = reviews?.reduce((acc, review) => {
    const routeId = review.routeId;
    if (!acc[routeId]) {
      acc[routeId] = {
        route: review.route,
        reviews: [],
      };
    }
    acc[routeId].reviews.push(review);
    return acc;
  }, {} as Record<number, { route: BusRoute; reviews: ReviewWithRouteAndUser[] }>);

  const routeGroups = reviewsByRoute ? Object.values(reviewsByRoute) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Route Reviews</h1>
          <p className="text-muted-foreground">See what fellow commuters are saying about bus routes across South Africa.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : routeGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
              <Link href="/routes">
                <Button className="mt-4" data-testid="link-browse-routes">Browse Routes</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {routeGroups.map(({ route, reviews: routeReviews }) => {
              const avgRating = routeReviews.reduce((sum, r) => sum + r.rating, 0) / routeReviews.length;
              
              return (
                <Card key={route.id} className="overflow-hidden" data-testid={`card-route-reviews-${route.id}`}>
                  <CardHeader className="bg-primary/5 border-b border-border/50">
                    <Link href={`/route/${route.id}`}>
                      <div className="flex items-start justify-between cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Bus className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h2 className="font-display font-bold text-lg">{route.name}</h2>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{route.startLocation} → {route.endLocation}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">{avgRating.toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{routeReviews.length} review{routeReviews.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </Link>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {routeReviews.map((review) => (
                        <div key={review.id} className="p-4" data-testid={`review-item-${review.id}`}>
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.user.profileImageUrl || undefined} />
                              <AvatarFallback>{(review.user.firstName || review.user.email || 'U')[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-sm truncate">
                                  {review.user.firstName || review.user.email?.split('@')[0] || 'User'}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {format(new Date(review.createdAt!), "MMM d, yyyy")}
                                </span>
                              </div>
                              <div className="flex gap-0.5 my-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.comment && (
                                <p className="text-sm text-foreground/80 mt-1">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
