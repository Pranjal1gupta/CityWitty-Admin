"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  Eye,
  Trash2,
  Clipboard,
  Download,
  Plus,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  Edit,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { LocationMultiSelect } from "@/components/ui/location-multi-select";

interface ICareerApplication {
  _id: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  position: string;
  joiningAvailability: string;
  houseNo: string;
  area: string;
  city: string;
  state: string;
  country: string;
  experience?: number | null;
  qualificationDegree: string;
  qualificationPercent: number;
  resumeUrl?: string | null;
  resumePublicId?: string | null;
  status: "Selected" | "Pending" | "Called for Interview" | "Rejected";
  expectedSalary?: number | null;
  createdAt: string;
}

interface Stats {
  total: number;
  pending: number;
  called: number;
  selected: number;
  rejected: number;
}

interface JobPost {
  _id: string;
  postName: string;
  description: string;
  minQualification: string;
  salary?: string;
  openings?: number;
  locations: string[];
  applicationDeadline?: string;
  workType?: "Remote" | "On-site" | "Hybrid";
  createdAt: string;
  updatedAt: string;
}

type ModalType = "view" | "delete" | "statusConfirm" | null;

export default function CareersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Filters & data
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [applications, setApplications] = useState<ICareerApplication[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    called: 0,
    selected: 0,
    rejected: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [positions, setPositions] = useState<string[]>([]);

  // Unified modal state for view/delete/status confirmation
  const [modal, setModal] = useState<{
    type: ModalType;
    application: ICareerApplication | null;
    pendingStatus?: string;
  }>({
    type: null,
    application: null,
  });

  // Job post modal state
  const [jobPostModalOpen, setJobPostModalOpen] = useState(false);
  const [jobPostData, setJobPostData] = useState<Partial<JobPost>>({
    postName: "",
    description: "",
    minQualification: "",
    salary: "",
    openings: undefined,
    locations: [],
    applicationDeadline: "",
    workType: undefined,
  });

  // Job posts state
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [jobPostsLoading, setJobPostsLoading] = useState(true);
  const [jobPostSearchTerm, setJobPostSearchTerm] = useState("");

  // Job post modals state
  const [viewJobPostModal, setViewJobPostModal] = useState<JobPost | null>(
    null
  );
  const [editJobPostModal, setEditJobPostModal] = useState<JobPost | null>(
    null
  );
  const [editJobPostData, setEditJobPostData] = useState<Partial<JobPost>>({});

  // small UI loaders
  const [exporting, setExporting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setDataLoading(true);

        const res = await fetch("/api/careers", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch careers");

        const data = await res.json();

        const applicationsData: ICareerApplication[] = data.applications || [];
        setApplications(applicationsData);

        // Stats: use backend if available, else calculate
        if (data.stats) setStats(data.stats);
        else setStats(calculateStats(applicationsData));

        // Unique positions (TypeScript-safe)
        const uniquePositions: string[] = Array.from(
          new Set(applicationsData.map((a) => a.position))
        ).filter((pos): pos is string => Boolean(pos));

        setPositions(uniquePositions);
      } catch (err) {
        console.error(err);
        toast.error("Error loading careers data");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();

    // re-run on pathname change so hot-reloads or other pages update
  }, [user, pathname]);

  // Fetch job posts on component mount
  useEffect(() => {
    if (!user) return;
    fetchJobPosts();
  }, [user]);

  const calculateStats = (applicationsList: ICareerApplication[]): Stats => ({
    total: applicationsList.length,
    pending: applicationsList.filter((app) => app.status === "Pending").length,
    called: applicationsList.filter(
      (app) => app.status === "Called for Interview"
    ).length,
    selected: applicationsList.filter((app) => app.status === "Selected")
      .length,
    rejected: applicationsList.filter((app) => app.status === "Rejected")
      .length,
  });

  // Filters
  const filteredApplications = applications.filter((application) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      application.fullName.toLowerCase().includes(q) ||
      application.email.toLowerCase().includes(q) ||
      application.phone.includes(q) ||
      application.applicationId.toLowerCase().includes(q) ||
      application.position.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || application.status === statusFilter;
    const matchesPosition =
      positionFilter === "all" || application.position === positionFilter;
    return matchesSearch && matchesStatus && matchesPosition;
  });

  // Job posts filter
  const filteredJobPosts = jobPosts.filter((jobPost) => {
    const q = jobPostSearchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      jobPost.postName.toLowerCase().includes(q) ||
      jobPost.locations.some(location => location.toLowerCase().includes(q)) ||
      (jobPost.workType && jobPost.workType.toLowerCase().includes(q));

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Selected":
        return <Badge className="bg-green-100 text-green-800">Selected</Badge>;
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "Called for Interview":
        return <Badge className="bg-blue-100 text-blue-800">Interview</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Update status helper: appId is _id
  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    setActionLoadingId(appId);
    try {
      const res = await fetch(`/api/careers/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setApplications((prev) => {
        const updatedList = prev.map((a) =>
          a._id === appId ? { ...a, ...updated } : a
        );
        setStats(calculateStats(updatedList));
        return updatedList;
      });
      toast.success("Status updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error updating status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete
  const handleDelete = async (appId: string) => {
    setActionLoadingId(appId);
    try {
      const res = await fetch(`/api/careers/${appId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete application");
      const result = await res.json();
      if (result.success) {
        const updated = applications.filter((a) => a._id !== appId);
        setApplications(updated);
        setStats(calculateStats(updated));
        toast.success("Application deleted");
      } else {
        throw new Error("Delete failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error deleting application");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Copy
  const handleCopyApplication = async (application: ICareerApplication) => {
    const copyText = `Application ID: ${application.applicationId}
Name: ${application.fullName}
Email: ${application.email}
Phone: ${application.phone}
Position: ${application.position}
Qualification: ${application.qualificationDegree} - ${
      application.qualificationPercent
    }%
${
  application.experience ? `Experience: ${application.experience} years\n` : ""
}${
      application.expectedSalary
        ? `Expected Salary: ${application.expectedSalary}\n`
        : ""
    }Applied On: ${new Date(application.createdAt).toLocaleDateString()}`;

    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("Application copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Export CSV
  const handleExportData = () => {
    setExporting(true);
    try {
      const headers = [
        "Application ID",
        "Full Name",
        "Email",
        "Phone",
        "Position",
        "Qualification",
        "Experience",
        "Expected Salary",
        "Status",
        "Applied On",
        "City",
        "State",
        "Country",
        "Resume URL",
      ];
      const csvData = filteredApplications.map((app) => [
        app.applicationId,
        app.fullName,
        app.email,
        app.phone,
        app.position,
        `${app.qualificationDegree} - ${app.qualificationPercent}%`,
        app.experience ?? "",
        app.expectedSalary ?? "",
        app.status,
        new Date(app.createdAt).toLocaleDateString(),
        app.city,
        app.state,
        app.country,
        app.resumeUrl ?? "",
      ]);
      const rows = [headers, ...csvData];
      const csvContent = rows
        .map((row) =>
          row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute(
        "download",
        `careers-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Exported CSV");
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  // Job post submit
  const handleCreateJobPost = async () => {
    // basic validation
    if (
      !jobPostData.postName?.trim() ||
      !jobPostData.description?.trim() ||
      !jobPostData.minQualification?.trim()
    ) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      const res = await fetch("/api/job-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobPostData),
      });
      if (!res.ok) throw new Error("Failed to create job post");
      await res.json();
      toast.success("Job post created");
      setJobPostModalOpen(false);
      setJobPostData({
        postName: "",
        description: "",
        minQualification: "",
        salary: "",
        openings: undefined,
        locations: [],
        applicationDeadline: "",
        workType: undefined,
      });
      // Refresh job posts list
      fetchJobPosts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create job post");
    }
  };

  // Fetch job posts
  const fetchJobPosts = async () => {
    try {
      setJobPostsLoading(true);
      const res = await fetch("/api/job-posts", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch job posts");
      const data = await res.json();
      setJobPosts(data.jobPosts || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Error loading job posts");
    } finally {
      setJobPostsLoading(false);
    }
  };

  // Copy job post data
  const handleCopyJobPost = async (jobPost: JobPost) => {
    const copyText = `Job Post: ${jobPost.postName}
Description: ${jobPost.description}
Minimum Qualification: ${jobPost.minQualification}
${jobPost.salary ? `Salary: ${jobPost.salary}\n` : ""}${
      jobPost.openings ? `Openings: ${jobPost.openings}\n` : ""
    }Locations: ${jobPost.locations.join(", ")}
${jobPost.workType ? `Work Type: ${jobPost.workType}\n` : ""}${
      jobPost.applicationDeadline
        ? `Application Deadline: ${jobPost.applicationDeadline}\n`
        : ""
    }Created: ${new Date(jobPost.createdAt).toLocaleDateString()}`;

    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("Job post copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  // View job post
  const handleViewJobPost = (jobPost: JobPost) => {
    setViewJobPostModal(jobPost);
  };

  // Edit job post
  const handleEditJobPost = (jobPost: JobPost) => {
    setEditJobPostModal(jobPost);
    setEditJobPostData({
      postName: jobPost.postName,
      description: jobPost.description,
      minQualification: jobPost.minQualification,
      salary: jobPost.salary,
      openings: jobPost.openings,
      locations: jobPost.locations,
      applicationDeadline: jobPost.applicationDeadline
        ? new Date(jobPost.applicationDeadline).toISOString().split("T")[0]
        : "",
      workType: jobPost.workType,
    });
  };

  // Update job post
  const handleUpdateJobPost = async () => {
    if (!editJobPostModal) return;

    try {
      const res = await fetch(`/api/job-posts/${editJobPostModal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editJobPostData),
      });
      if (!res.ok) throw new Error("Failed to update job post");
      await res.json();
      toast.success("Job post updated");
      setEditJobPostModal(null);
      setEditJobPostData({});
      fetchJobPosts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update job post");
    }
  };

  // Delete job post
  const handleDeleteJobPost = async (jobPostId: string) => {
    try {
      const res = await fetch(`/api/job-posts/${jobPostId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete job post");
      await res.json();
      toast.success("Job post deleted");
      fetchJobPosts();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete job post");
    }
  };

  // UI helpers
  const statuses = ["Selected", "Pending", "Called for Interview", "Rejected"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Careers</h1>
            <p className="text-sm text-gray-600">
              Manage career applications and job posts
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex gap-2">
              <Button
                className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00] capitalize"
                onClick={handleExportData}
                disabled={exporting}
              >
                <Download className="mr-2 h-4 w-4" />
                Export applicant Data
              </Button>
              <Button
                onClick={() => setJobPostModalOpen(true)}
                className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add a New Post
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobPosts.length.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Job openings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Applicants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">All applicants</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => setStatusFilter("pending")}
            className="cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => setStatusFilter("Called for Interview")}
            className="cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Called</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.called.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Interview calls</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => setStatusFilter("Selected")}
            className="cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Selected</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.selected.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Hired</p>
            </CardContent>
          </Card>

          <Card
            onClick={() => setStatusFilter("Rejected")}
            className="cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Rejected</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Job Posts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Job Posts</CardTitle>
            <CardDescription>Manage job openings and postings</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Job Posts Search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search job posts by name, location, or work type..."
                  value={jobPostSearchTerm}
                  onChange={(e) => setJobPostSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Job Posts Table */}
            {jobPostsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4AA8FF] mx-auto" />
                <p className="text-gray-500 mt-2">Loading job posts...</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow >
                      <TableHead >Post Name</TableHead>
                      <TableHead>Locations</TableHead>
                      <TableHead>Work Type</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Openings</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobPosts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          {jobPosts.length === 0 ? "No job posts found." : "No job posts match your search."}
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredJobPosts.map((jobPost) => (
                      <TableRow key={jobPost._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {jobPost.postName}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {jobPost.locations
                              .slice(0, 2)
                              .map((location, idx) => (
                                <p key={idx} className="capitalize">{location}</p>
                              ))}
                            {jobPost.locations.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{jobPost.locations.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              jobPost.workType === "Remote"
                                ? "default"
                                : jobPost.workType === "On-site"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {jobPost.workType || "N/A"}
                          </Badge>
                        </TableCell>

                        <TableCell>{jobPost.salary || "N/A"}</TableCell>

                        <TableCell>
                          {jobPost.openings ? jobPost.openings : "N/A"}
                        </TableCell>

                        <TableCell>
                          {jobPost.applicationDeadline
                            ? new Date(
                                jobPost.applicationDeadline
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>

                        <TableCell>
                          {new Date(jobPost.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyJobPost(jobPost)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewJobPost(jobPost)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditJobPost(jobPost)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteJobPost(jobPost._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              Search, filter, and manage applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, phone, ID or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Called for Interview">
                    Called for Interview
                  </SelectItem>
                  <SelectItem value="Selected">Selected</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4AA8FF] mx-auto" />
                <p className="text-gray-500 mt-2">Loading applications...</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Qualification / Exp</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No applications found.
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredApplications.map((app) => (
                      <TableRow key={app._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {app.applicationId}
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium">{app.fullName}</div>
                            <div className="text-sm text-gray-500">
                              {app.email} • {app.phone}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{app.position}</TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {app.qualificationDegree} •{" "}
                            {app.qualificationPercent}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {app.experience ? `${app.experience} yrs` : "Fresh"}
                          </div>
                        </TableCell>

                        <TableCell>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell>{getStatusBadge(app.status)}</TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={
                                app.status === "Called for Interview"
                                  ? "Interview"
                                  : app.status
                              }
                              onValueChange={(newStatus) => {
                                setModal({
                                  type: "statusConfirm",
                                  application: app,
                                  pendingStatus:
                                    newStatus === "Interview"
                                      ? "Called for Interview"
                                      : newStatus,
                                });
                              }}
                              disabled={actionLoadingId === app._id}
                            >
                              <SelectTrigger className="w-max">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((s) => (
                                  <SelectItem
                                    key={s}
                                    value={
                                      s === "Called for Interview"
                                        ? "Interview"
                                        : s
                                    }
                                  >
                                    {s === "Called for Interview"
                                      ? "Interview"
                                      : s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyApplication(app)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setModal({ type: "view", application: app })
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setModal({ type: "delete", application: app })
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals - Status Confirm */}
        {modal.type === "statusConfirm" &&
          modal.application &&
          modal.pendingStatus && (
            <Dialog
              open
              onOpenChange={() => setModal({ type: null, application: null })}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Application Status</DialogTitle>
                  <DialogDescription>
                    Change status of{" "}
                    <span className="font-semibold">
                      {modal.application.fullName}
                    </span>{" "}
                    from{" "}
                    <span className="italic">{modal.application.status}</span>{" "}
                    to{" "}
                    <span className="font-semibold">{modal.pendingStatus}</span>
                    ?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setModal({ type: null, application: null })}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={async () => {
                      await handleStatusUpdate(
                        modal.application!._id,
                        modal.pendingStatus!
                      );
                      setModal({ type: null, application: null });
                    }}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

        {/* Modals - Delete */}
        {modal.type === "delete" && modal.application && (
          <Dialog
            open
            onOpenChange={() => setModal({ type: null, application: null })}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Application</DialogTitle>
                <DialogDescription>
                  Are you sure you want to permanently delete application of{" "}
                  <span className="font-semibold">
                    {modal.application.fullName}
                  </span>
                  ? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setModal({ type: null, application: null })}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    await handleDelete(modal.application!._id);
                    setModal({ type: null, application: null });
                  }}
                  disabled={actionLoadingId === modal.application._id}
                >
                  Yes, Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Modals - View */}
        {modal.type === "view" && modal.application && (
          <Dialog
            open
            onOpenChange={() => setModal({ type: null, application: null })}
          >
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  Full details for{" "}
                  <span className="font-semibold">
                    {modal.application.fullName}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <p>
                  <strong>Application ID:</strong>{" "}
                  {modal.application.applicationId}
                </p>
                <p>
                  <strong>Name:</strong> {modal.application.fullName}
                </p>
                <p>
                  <strong>Email:</strong> {modal.application.email}
                </p>
                <p>
                  <strong>Phone:</strong> {modal.application.phone}
                </p>
                <p>
                  <strong>DOB:</strong>{" "}
                  {new Date(modal.application.dob).toLocaleDateString()}
                </p>
                <p>
                  <strong>Position:</strong> {modal.application.position}
                </p>
                <p>
                  <strong>Joining Availability:</strong>{" "}
                  {modal.application.joiningAvailability}
                </p>
                <p>
                  <strong>Address:</strong> {modal.application.houseNo},{" "}
                  {modal.application.area}, {modal.application.city},{" "}
                  {modal.application.state} - {modal.application.country}
                </p>
                <p>
                  <strong>Qualification:</strong>{" "}
                  {modal.application.qualificationDegree} •{" "}
                  {modal.application.qualificationPercent}%
                </p>
                <p>
                  <strong>Experience:</strong>{" "}
                  {modal.application.experience ?? "0"} years
                </p>
                <p>
                  <strong>Expected Salary:</strong>{" "}
                  {modal.application.expectedSalary ?? "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {modal.application.status}
                </p>
                <p>
                  <strong>Applied On:</strong>{" "}
                  {new Date(modal.application.createdAt).toLocaleString()}
                </p>
                {modal.application.resumeUrl && (
                  <p>
                    <strong>Resume:</strong>{" "}
                    <a
                      href={modal.application.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      View / Download
                    </a>
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setModal({ type: null, application: null })}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Job Post Modal */}
        <Dialog open={jobPostModalOpen} onOpenChange={setJobPostModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add a New Job Post</DialogTitle>
              <DialogDescription>
                Provide details for the new job opening
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                placeholder="Post Name"
                value={jobPostData.postName}
                onChange={(e) =>
                  setJobPostData((p) => ({ ...p, postName: e.target.value }))
                }
              />
              <Textarea
                placeholder="Complete description"
                value={jobPostData.description}
                onChange={(e) =>
                  setJobPostData((p) => ({ ...p, description: e.target.value }))
                }
                rows={6}
              />
              <Input
                placeholder="Minimum qualification"
                value={jobPostData.minQualification}
                onChange={(e) =>
                  setJobPostData((p) => ({
                    ...p,
                    minQualification: e.target.value,
                  }))
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Salary (e.g. 25000-35000)"
                  value={jobPostData.salary}
                  onChange={(e) =>
                    setJobPostData((p) => ({ ...p, salary: e.target.value }))
                  }
                />
                <Input
                  placeholder="Openings"
                  type="number"
                  value={jobPostData.openings ?? ""}
                  onChange={(e) =>
                    setJobPostData((p) => ({
                      ...p,
                      openings: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                />
                <Input
                  type="date"
                  value={jobPostData.applicationDeadline ?? ""}
                  onChange={(e) =>
                    setJobPostData((p) => ({
                      ...p,
                      applicationDeadline: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Location Multi-Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Locations</label>
                <LocationMultiSelect
                  value={jobPostData.locations || []}
                  onChange={(locations) =>
                    setJobPostData((p) => ({ ...p, locations }))
                  }
                  placeholder="Select locations for this job post..."
                />
              </div>

              <Select
                value={jobPostData.workType ?? ""}
                onValueChange={(v) =>
                  setJobPostData((p) => ({ ...p, workType: v as any }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Work Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="On-site">On-site</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setJobPostModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleCreateJobPost}
              >
                Create Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Job Post Modal */}
        <Dialog
          open={!!viewJobPostModal}
          onOpenChange={() => setViewJobPostModal(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Job Post Details</DialogTitle>
              <DialogDescription>
                Complete details for the job posting
              </DialogDescription>
            </DialogHeader>

            {viewJobPostModal && (
              <div className="space-y-3 text-sm">
                <p>
                  <strong>Post Name:</strong> {viewJobPostModal.postName}
                </p>
                <p>
                  <strong>Description:</strong> {viewJobPostModal.description}
                </p>
                <p>
                  <strong>Minimum Qualification:</strong>{" "}
                  {viewJobPostModal.minQualification}
                </p>
                <p>
                  <strong>Salary:</strong> {viewJobPostModal.salary || "N/A"}
                </p>
                <p>
                  <strong>Openings:</strong>{" "}
                  {viewJobPostModal.openings || "N/A"}
                </p>
                <p>
                  <strong>Locations:</strong>{" "}
                  {viewJobPostModal.locations.join(", ")}
                </p>
                <p>
                  <strong>Work Type:</strong>{" "}
                  {viewJobPostModal.workType || "N/A"}
                </p>
                <p>
                  <strong>Application Deadline:</strong>{" "}
                  {viewJobPostModal.applicationDeadline
                    ? new Date(
                        viewJobPostModal.applicationDeadline
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {new Date(viewJobPostModal.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(viewJobPostModal.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewJobPostModal(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Job Post Modal */}
        <Dialog
          open={!!editJobPostModal}
          onOpenChange={() => setEditJobPostModal(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Job Post</DialogTitle>
              <DialogDescription>
                Update the job posting details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                placeholder="Post Name"
                value={editJobPostData.postName || ""}
                onChange={(e) =>
                  setEditJobPostData((p) => ({
                    ...p,
                    postName: e.target.value,
                  }))
                }
              />
              <Textarea
                placeholder="Complete description"
                value={editJobPostData.description || ""}
                onChange={(e) =>
                  setEditJobPostData((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                rows={6}
              />
              <Input
                placeholder="Minimum qualification"
                value={editJobPostData.minQualification || ""}
                onChange={(e) =>
                  setEditJobPostData((p) => ({
                    ...p,
                    minQualification: e.target.value,
                  }))
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Salary (e.g. 25000-35000)"
                  value={editJobPostData.salary || ""}
                  onChange={(e) =>
                    setEditJobPostData((p) => ({
                      ...p,
                      salary: e.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Openings"
                  type="number"
                  value={editJobPostData.openings ?? ""}
                  onChange={(e) =>
                    setEditJobPostData((p) => ({
                      ...p,
                      openings: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                />
                <Input
                  type="date"
                  value={editJobPostData.applicationDeadline ?? ""}
                  onChange={(e) =>
                    setEditJobPostData((p) => ({
                      ...p,
                      applicationDeadline: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Location Multi-Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Locations</label>
                <LocationMultiSelect
                  value={editJobPostData.locations || []}
                  onChange={(locations) =>
                    setEditJobPostData((p) => ({ ...p, locations }))
                  }
                  placeholder="Select locations for this job post..."
                />
              </div>

              <Select
                value={editJobPostData.workType ?? ""}
                onValueChange={(v) =>
                  setEditJobPostData((p) => ({ ...p, workType: v as any }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Work Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="On-site">On-site</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditJobPostModal(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleUpdateJobPost}
              >
                Update Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
