import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateJob } from "@/hooks/use-jobs";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Loader2, Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { type Job } from "@shared/schema";

const jobFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  company: z.string().min(2, "Company name is required"),
  contactInfo: z.string().min(5, "Contact info is required (phone or email)"),
  salary: z.string().optional(),
  requirements: z.string().optional(),
  jobType: z.string().default("full-time"),
  category: z.string().default("technology"),
  experienceLevel: z.string().default("mid"),
  skillsInput: z.string().optional(),
  expiryDate: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface EditJobDialogProps {
  job: Job;
}

export function EditJobDialog({ job }: EditJobDialogProps) {
  const [open, setOpen] = useState(false);
  const updateJob = useUpdateJob();
  const { toast } = useToast();

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job.title,
      description: job.description,
      location: job.location,
      company: job.company,
      contactInfo: job.contactInfo,
      salary: job.salary || "",
      requirements: job.requirements || "",
      jobType: job.jobType || "full-time",
      category: job.category || "technology",
      skillsInput: job.skills?.join(", ") || "",
      experienceLevel: job.experienceLevel || "mid",
      expiryDate: job.expiryDate ? new Date(job.expiryDate) : undefined,
      isActive: job.isActive ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: job.title,
        description: job.description,
        location: job.location,
        company: job.company,
        contactInfo: job.contactInfo,
        salary: job.salary || "",
        requirements: job.requirements || "",
        jobType: job.jobType || "full-time",
        category: job.category || "technology",
        skillsInput: job.skills?.join(", ") || "",
        experienceLevel: job.experienceLevel || "mid",
        expiryDate: job.expiryDate ? new Date(job.expiryDate) : undefined,
        isActive: job.isActive ?? true,
      });
    }
  }, [open, job, form]);

  const onSubmit = async (data: JobFormValues) => {
    try {
      const skillsArray = data.skillsInput 
        ? data.skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];
      
      const { skillsInput, ...restData } = data;
      
      await updateJob.mutateAsync({
        id: job.id,
        data: {
          ...restData,
          skills: skillsArray,
        },
      });
      toast({
        title: "Job Updated",
        description: "The job listing has been updated successfully.",
      });
      setOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update job listing.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" data-testid={`button-edit-job-${job.id}`}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>
            Update the job listing details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Software Developer" {...field} data-testid="input-edit-job-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., MzansiMove" {...field} data-testid="input-edit-job-company" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Johannesburg, Gauteng" {...field} data-testid="input-edit-job-location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-job-type">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-job-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="technology">Technology / Development</SelectItem>
                      <SelectItem value="design">Design / UI/UX</SelectItem>
                      <SelectItem value="data">Data / Analytics</SelectItem>
                      <SelectItem value="management">Project Management</SelectItem>
                      <SelectItem value="support">IT Support</SelectItem>
                      <SelectItem value="marketing">Marketing / Digital</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-experience-level">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level / Graduate</SelectItem>
                      <SelectItem value="junior">Junior (1-2 years)</SelectItem>
                      <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior (5+ years)</SelectItem>
                      <SelectItem value="lead">Lead / Principal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skillsInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., React, TypeScript, Node.js, Python" 
                      {...field} 
                      data-testid="input-edit-job-skills"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Separate skills with commas</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., R15,000 - R20,000 per month" {...field} data-testid="input-edit-job-salary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="button-edit-expiry-date"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick an expiry date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">Job will be hidden after this date</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the job role and responsibilities..." 
                      className="min-h-[100px]"
                      {...field} 
                      data-testid="input-edit-job-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., 3+ years experience in React, Node.js knowledge..." 
                      className="min-h-[80px]"
                      {...field} 
                      data-testid="input-edit-job-requirements"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Information</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., WhatsApp: 082 123 4567 or email@company.co.za" 
                      {...field} 
                      data-testid="input-edit-job-contact"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={updateJob.isPending}
              data-testid="button-submit-edit-job"
            >
              {updateJob.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Job"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
