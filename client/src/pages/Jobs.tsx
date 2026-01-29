import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useJobs, useDeleteJob } from "@/hooks/use-jobs";
import { useJobApplicationsByEmail, useDeleteJobApplication } from "@/hooks/use-job-applications";
import { useAdminMode } from "@/hooks/use-admin-mode";
import { CreateJobDialog } from "@/components/CreateJobDialog";
import { EditJobDialog } from "@/components/EditJobDialog";
import { ApplyJobDialog } from "@/components/ApplyJobDialog";
import { EditApplicationDialog } from "@/components/EditApplicationDialog";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, MapPin, Building2, Phone, Loader2, Trash2, Clock, Banknote, Code, GraduationCap, CalendarX, Filter, ChevronDown, ChevronUp, FileText, Search, Mail } from "lucide-react";
import { format, isPast } from "date-fns";
import { type Job, type JobApplication } from "@shared/schema";

function JobCard({ job, isAdmin }: { job: Job; isAdmin: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const deleteJob = useDeleteJob();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      deleteJob.mutate(job.id);
    }
  };

  const jobTypeColors: Record<string, string> = {
    "full-time": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    "part-time": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    "contract": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    "internship": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    "remote": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100",
  };

  const categoryLabels: Record<string, string> = {
    "technology": "Technology",
    "design": "Design",
    "data": "Data & Analytics",
    "management": "Management",
    "support": "IT Support",
    "marketing": "Marketing",
    "other": "Other",
  };

  const experienceLabels: Record<string, string> = {
    "entry": "Entry Level",
    "junior": "Junior",
    "mid": "Mid-Level",
    "senior": "Senior",
    "lead": "Lead",
  };

  const isExpired = job.expiryDate && isPast(new Date(job.expiryDate));

  return (
    <Card className={`group hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden ${isExpired ? 'opacity-60' : ''}`} data-testid={`job-card-${job.id}`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${isExpired ? 'bg-gradient-to-b from-destructive to-destructive/50' : 'bg-gradient-to-b from-secondary to-secondary/50'} group-hover:w-2 transition-all duration-300`} />
      
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div className="flex flex-wrap gap-1">
            <Badge 
              className={`${jobTypeColors[job.jobType || "full-time"] || "bg-gray-100 text-gray-800"}`}
            >
              {(job.jobType || "full-time").replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            {job.category && (
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[job.category] || job.category}
              </Badge>
            )}
            {isExpired && isAdmin && (
              <Badge variant="destructive" className="text-xs">
                <CalendarX className="h-3 w-3 mr-1" />
                Expired
              </Badge>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="font-mono text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {job.createdAt ? format(new Date(job.createdAt), "dd MMM yyyy") : "Recent"}
            </Badge>
            {job.expiryDate && (
              <Badge variant={isExpired ? "destructive" : "outline"} className="font-mono text-xs">
                <CalendarX className="h-3 w-3 mr-1" />
                {isExpired ? "Expired" : `Expires ${format(new Date(job.expiryDate), "dd MMM yyyy")}`}
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-xl font-display text-primary mt-2">
          {job.title}
        </CardTitle>
        {job.experienceLevel && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <GraduationCap className="h-3 w-3" />
            <span>{experienceLabels[job.experienceLevel] || job.experienceLevel}</span>
          </div>
        )}
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

        <div>
          <p className={`text-sm text-muted-foreground leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {job.description}
          </p>
          {job.description && job.description.length > 150 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 mt-1 text-xs text-primary hover:text-primary/80"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid={`button-read-more-${job.id}`}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Read Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Read More
                </>
              )}
            </Button>
          )}
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-primary/5">
                <Code className="h-2.5 w-2.5 mr-1" />
                {skill}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{job.skills.length - 5} more
              </Badge>
            )}
          </div>
        )}

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

        {!isExpired && !isAdmin && (
          <ApplyJobDialog job={job} />
        )}

        {isAdmin && (
          <div className="w-full flex gap-2">
            <EditJobDialog job={job} />
            <Button 
              variant="destructive" 
              size="sm"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleteJob.isPending}
              data-testid={`button-delete-job-${job.id}`}
            >
              {deleteJob.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

function MyApplications() {
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const { data: applications, isLoading } = useJobApplicationsByEmail(searchEmail);
  const deleteApplication = useDeleteJobApplication();

  const handleSearch = () => {
    if (email.trim()) {
      setSearchEmail(email.trim());
    }
  };

  const handleDelete = (id: number, email: string) => {
    if (confirm("Are you sure you want to withdraw this application?")) {
      deleteApplication.mutate({ id, ownerEmail: email });
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
    reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    shortlisted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    hired: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input 
                type="email"
                placeholder="Enter your email to view your applications"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                data-testid="input-search-applications-email"
              />
            </div>
            <Button onClick={handleSearch} className="gap-2" data-testid="button-search-applications">
              <Search className="h-4 w-4" />
              Find My Applications
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchEmail && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} data-testid={`application-card-${app.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg">{app.job.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{app.job.company}</p>
                      </div>
                      <Badge className={statusColors[app.status || "pending"]}>
                        {(app.status || "pending").charAt(0).toUpperCase() + (app.status || "pending").slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{app.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{app.phone}</span>
                      </div>
                    </div>
                    {app.coverLetter && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{app.coverLetter}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Applied: {app.createdAt ? format(new Date(app.createdAt), "dd MMM yyyy") : "Unknown"}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <EditApplicationDialog application={app} />
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(app.id, app.email)}
                      disabled={deleteApplication.isPending}
                      data-testid={`button-delete-application-${app.id}`}
                    >
                      {deleteApplication.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Withdraw
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
              <p className="text-muted-foreground">
                No applications found for {searchEmail}. Apply to jobs to see them here.
              </p>
            </div>
          )}
        </>
      )}

      {!searchEmail && (
        <div className="text-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Track Your Applications</h3>
          <p className="text-muted-foreground">
            Enter your email address above to view and manage your job applications.
          </p>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  const { isAdmin } = useAdminMode();
  const { data: jobs, isLoading } = useJobs(!isAdmin);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("jobs");

  const categoryLabels: Record<string, string> = {
    "all": "All Categories",
    "technology": "Technology",
    "design": "Design",
    "data": "Data & Analytics",
    "management": "Management",
    "support": "IT Support",
    "marketing": "Marketing",
    "other": "Other",
  };

  const filteredJobs = jobs?.filter(job => 
    selectedCategory === "all" || job.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-secondary" />
              Career Opportunities
            </h1>
            <p className="text-muted-foreground mt-1">
              Join our team and help grow critical skills in South Africa.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {activeTab === "jobs" && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {isAdmin && <CreateJobDialog />}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6" data-testid="tabs-jobs">
            <TabsTrigger value="jobs" className="gap-2" data-testid="tab-jobs">
              <Briefcase className="h-4 w-4" />
              Available Jobs
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2" data-testid="tab-applications">
              <FileText className="h-4 w-4" />
              My Applications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredJobs && filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} isAdmin={isAdmin} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">
                  {selectedCategory !== "all" ? "No Jobs in This Category" : "No Positions Available"}
                </h2>
                <p className="text-muted-foreground">
                  {selectedCategory !== "all" 
                    ? "Try selecting a different category or check back later."
                    : "We're always looking for talented people. Check back soon for new career opportunities."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications">
            <MyApplications />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
