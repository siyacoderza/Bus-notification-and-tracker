import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Building2, Mail, Phone, Globe, Target, Calendar, CheckCircle2, Loader2 } from "lucide-react";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  industry: z.string().optional(),
  placementType: z.enum(["standard", "premium", "exclusive"]),
  budget: z.string().optional(),
  targetRoutes: z.string().optional(),
  campaignGoals: z.string().optional(),
  startDate: z.string().optional(),
  duration: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const placementOptions = [
  { value: "standard", label: "Standard", price: "R575 - R2,300/month", description: "Logo badge on route cards (incl. 15% VAT)" },
  { value: "premium", label: "Premium", price: "R3,450 - R5,750/month", description: "Featured banner on route details (incl. 15% VAT)" },
  { value: "exclusive", label: "Exclusive", price: "R9,200 - R17,250/month", description: "Full sponsorship with priority placement (incl. 15% VAT)" },
];

const budgetOptions = [
  "Under R2,300/month (incl. VAT)",
  "R2,300 - R5,750/month (incl. VAT)",
  "R5,750 - R11,500/month (incl. VAT)",
  "R11,500 - R23,000/month (incl. VAT)",
  "R23,000+/month (incl. VAT)",
];

const durationOptions = [
  "1 month trial",
  "3 months",
  "6 months",
  "12 months",
  "Ongoing / Flexible",
];

export default function AdvertisePage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      placementType: "standard",
      budget: "",
      targetRoutes: "",
      campaignGoals: "",
      startDate: "",
      duration: "",
      message: "",
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/advertiser-applications", data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({ title: "Application submitted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to submit application", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormValues) => {
    submitApplication.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Application Received!
              </h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your interest in advertising with MzansiMove. Our team will review your 
                application and contact you within 2-3 business days to discuss your campaign.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline">
                Submit Another Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Megaphone className="h-10 w-10 text-secondary" />
            <h1 className="font-display text-3xl font-bold text-primary">Advertise With Us</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Reach thousands of South African commuters daily. Partner with MzansiMove to promote your 
            brand on bus routes across the country.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {placementOptions.map((option) => (
            <Card key={option.value} className="text-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{option.label}</CardTitle>
                <CardDescription className="text-secondary font-semibold">{option.price}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-secondary" />
              Advertiser Application
            </CardTitle>
            <CardDescription>
              Complete the form below and our team will reach out to discuss your advertising needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your company name" {...field} data-testid="input-company-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} data-testid="input-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="you@company.com" className="pl-10" {...field} data-testid="input-email" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="+27 XX XXX XXXX" className="pl-10" {...field} data-testid="input-phone" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Website</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="https://yourcompany.com" className="pl-10" {...field} data-testid="input-website" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Retail, Finance, Telecom" {...field} data-testid="input-industry" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-secondary" />
                    Campaign Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="placementType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Placement *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-placement">
                                <SelectValue placeholder="Select placement type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {placementOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label} ({option.price})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Budget</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-budget">
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {budgetOptions.map((budget) => (
                                <SelectItem key={budget} value={budget}>{budget}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Start Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="date" className="pl-10" {...field} data-testid="input-start-date" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Duration</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-duration">
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {durationOptions.map((duration) => (
                                <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="targetRoutes"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Target Routes / Areas</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Johannesburg CBD routes, Cape Town Metro, Nationwide" 
                            {...field} 
                            data-testid="input-target-routes"
                          />
                        </FormControl>
                        <FormDescription>
                          Specify which routes or regions you'd like to target, or leave blank for all routes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="campaignGoals"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Campaign Goals</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What do you hope to achieve with this campaign? (e.g., brand awareness, product launch, lead generation)"
                            className="resize-none"
                            {...field}
                            data-testid="input-campaign-goals"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any other information you'd like to share..."
                            className="resize-none"
                            {...field}
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitApplication.isPending}
                  data-testid="button-submit-application"
                >
                  {submitApplication.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Megaphone className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
