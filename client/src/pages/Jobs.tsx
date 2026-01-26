import { Navbar } from "@/components/Navbar";
import { useJobs, useDeleteJob } from "@/hooks/use-jobs";
import { useAdminMode } from "@/hooks/use-admin-mode";
import { CreateJobDialog } from "@/components/CreateJobDialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Building2, Phone, Loader2, Trash2, Clock, Banknote } from "lucide-react";
import { format } from "date-fns";
import { type Job } from "@shared/schema";

function JobCard({ job, isAdmin }: { job: Job; isAdmin: boolean }) {
  const deleteJob = useDeleteJob();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      deleteJob.mutate(job.id);
    }
  };

  const jobTypeColors: Record<string, string> = {
    "full-time": "bg-green-100 text-green-800",
    "part-time": "bg-blue-100 text-blue-800",
    "contract": "bg-purple-100 text-purple-800",
    "casual": "bg-orange-100 text-orange-800",
  };

  return (
    <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden" data-testid={`job-card-${job.id}`}>
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-secondary to-secondary/50 group-hover:w-2 transition-all duration-300" />
      
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <Badge 
            className={`${jobTypeColors[job.jobType || "full-time"] || "bg-gray-100 text-gray-800"}`}
          >
            {(job.jobType || "full-time").replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {job.createdAt ? format(new Date(job.createdAt), "dd MMM yyyy") : "Recent"}
          </Badge>
        </div>
        <CardTitle className="text-xl font-display text-primary mt-2">
          {job.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{job.company}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>

        {job.salary && (
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <Banknote className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {job.description}
        </p>

        {job.requirements && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">Requirements:</p>
            <p className="text-sm line-clamp-2">{job.requirements}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="w-full bg-primary/5 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Phone className="h-4 w-4" />
            <span>Contact:</span>
          </div>
          <p className="text-sm mt-1">{job.contactInfo}</p>
        </div>

        {isAdmin && (
          <Button 
            variant="destructive" 
            size="sm"
            className="w-full"
            onClick={handleDelete}
            disabled={deleteJob.isPending}
            data-testid={`button-delete-job-${job.id}`}
          >
            {deleteJob.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Job
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function JobsPage() {
  const { isAdmin } = useAdminMode();
  const { data: jobs, isLoading } = useJobs();

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-secondary" />
              Transport Jobs
            </h1>
            <p className="text-muted-foreground mt-1">
              Find bus driver and transport-related job opportunities.
            </p>
          </div>
          
          {isAdmin && <CreateJobDialog />}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Jobs Available</h2>
            <p className="text-muted-foreground">
              Check back later for new job opportunities.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
