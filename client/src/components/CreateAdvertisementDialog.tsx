import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAdvertisement } from "@/hooks/use-advertisements";
import { useRoutes } from "@/hooks/use-routes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Megaphone } from "lucide-react";
import { addDays, format } from "date-fns";

const formSchema = z.object({
  sponsorName: z.string().min(1, "Sponsor name is required"),
  sponsorLogo: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  linkUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  placementType: z.enum(["standard", "premium", "exclusive"]),
  pricePerMonth: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  routeIds: z.array(z.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateAdvertisementDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createAd = useCreateAdvertisement();
  const { data: routes } = useRoutes();
  const [selectedRoutes, setSelectedRoutes] = useState<number[]>([]);
  const [allRoutes, setAllRoutes] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sponsorName: "",
      sponsorLogo: "",
      message: "",
      linkUrl: "",
      placementType: "standard",
      pricePerMonth: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      routeIds: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createAd.mutateAsync({
        sponsorName: data.sponsorName,
        sponsorLogo: data.sponsorLogo || null,
        message: data.message,
        linkUrl: data.linkUrl || null,
        placementType: data.placementType,
        pricePerMonth: data.pricePerMonth ? parseInt(data.pricePerMonth) * 100 : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        routeIds: allRoutes ? null : selectedRoutes,
        isActive: true,
      });
      toast({ title: "Advertisement created successfully" });
      form.reset();
      setSelectedRoutes([]);
      setAllRoutes(true);
      setOpen(false);
    } catch (error) {
      toast({ title: "Failed to create advertisement", variant: "destructive" });
    }
  };

  const toggleRoute = (routeId: number) => {
    setSelectedRoutes(prev => 
      prev.includes(routeId) 
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const placementPricing = {
    standard: "R500 - R2,000/month",
    premium: "R3,000 - R5,000/month",
    exclusive: "R8,000 - R15,000/month",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-advertisement">
          <Plus className="h-4 w-4 mr-2" />
          New Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-secondary" />
            Create Sponsored Route Advertisement
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sponsorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sponsor/Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MTN, Vodacom, FNB" {...field} data-testid="input-sponsor-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sponsorLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} data-testid="input-sponsor-logo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotional Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Your ad message that will appear on route pages..." 
                      className="resize-none"
                      {...field} 
                      data-testid="input-ad-message"
                    />
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
                  <FormLabel>Click-through URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://sponsor-website.com" {...field} data-testid="input-link-url" />
                  </FormControl>
                  <FormDescription>Where users go when they click the ad</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="placementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placement Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-placement-type">
                          <SelectValue placeholder="Select placement type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard ({placementPricing.standard})</SelectItem>
                        <SelectItem value="premium">Premium ({placementPricing.premium})</SelectItem>
                        <SelectItem value="exclusive">Exclusive ({placementPricing.exclusive})</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Month (ZAR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2000" {...field} data-testid="input-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-start-date" />
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
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-end-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormLabel>Route Selection</FormLabel>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-routes"
                  checked={allRoutes}
                  onCheckedChange={(checked) => {
                    setAllRoutes(!!checked);
                    if (checked) setSelectedRoutes([]);
                  }}
                  data-testid="checkbox-all-routes"
                />
                <label htmlFor="all-routes" className="text-sm font-medium cursor-pointer">
                  Apply to all routes (network-wide)
                </label>
              </div>

              {!allRoutes && routes && routes.length > 0 && (
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {routes.map((route) => (
                    <div key={route.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`route-${route.id}`}
                        checked={selectedRoutes.includes(route.id)}
                        onCheckedChange={() => toggleRoute(route.id)}
                        data-testid={`checkbox-route-${route.id}`}
                      />
                      <label htmlFor={`route-${route.id}`} className="text-sm cursor-pointer">
                        {route.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={createAd.isPending} data-testid="button-submit-ad">
              {createAd.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Megaphone className="h-4 w-4 mr-2" />
                  Create Advertisement
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
