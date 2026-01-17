import { useQuery, useMutation } from "@tanstack/react-query";
import { Review, InsertReview, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { format } from "date-fns";

export function ReviewList({ routeId }: { routeId: number }) {
  const { data: reviews, isLoading } = useQuery<(Review & { user: User })[]>({
    queryKey: [`/api/routes/${routeId}/reviews`],
  });

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin mx-auto" />;

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-bold">Reviews & Ratings</h3>
      {reviews?.length === 0 ? (
        <p className="text-muted-foreground text-sm italic">No reviews yet. Be the first to rate!</p>
      ) : (
        reviews?.map((review) => (
          <Card key={review.id} className="bg-muted/30 border-none shadow-none">
            <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={review.user.profileImageUrl || undefined} />
                <AvatarFallback>{review.user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{review.user.firstName || review.user.email?.split('@')[0] || 'User'}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(review.createdAt!), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-sm text-foreground/80">{review.comment}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export function ReviewForm({ routeId }: { routeId: number }) {
  const [rating, setRating] = useState(0);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<InsertReview>();

  const mutation = useMutation({
    mutationFn: async (data: InsertReview) => {
      const res = await apiRequest("POST", `/api/routes/${routeId}/reviews`, { ...data, rating });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/routes/${routeId}/reviews`] });
      reset();
      setRating(0);
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border/50">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Your Rating:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              className="focus:outline-none transition-transform active:scale-95"
            >
              <Star className={`h-5 w-5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
            </button>
          ))}
        </div>
      </div>
      <Textarea
        {...register("comment")}
        placeholder="Share your experience with this bus stop..."
        className="resize-none bg-white/50"
        rows={3}
      />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={rating === 0 || mutation.isPending}
      >
        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Submit Review"}
      </Button>
    </form>
  );
}
