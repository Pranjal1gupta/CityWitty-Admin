"use client";

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import {
  Store,
  Users,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

interface Merchant {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  status: string;
  registrationDate: string;
  address: string;
  totalTransactions: number;
  totalRevenue: number;
  discountsOffered: string;
  deactivationReason?: string;
}

interface Stats {
  totalMerchants: number;
  activeMerchants: number;
  pendingApprovals: number;
  suspendedMerchants: number;
}

export default function MerchantsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalMerchants: 0,
    activeMerchants: 0,
    pendingApprovals: 0,
    suspendedMerchants: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Export merchants to CSV
  const handleExportMerchants = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Category",
      "Status",
      "Registration Date",
      "Address",
      "Total Transactions",
      "Total Revenue",
      "Discounts Offered",
      "Deactivation Reason",
    ];

    const csvData = filteredMerchants.map((merchant) => [
      merchant.id,
      merchant.name,
      merchant.email,
      merchant.phone,
      merchant.category,
      merchant.status,
      merchant.registrationDate,
      merchant.address,
      merchant.totalTransactions,
      merchant.totalRevenue,
      merchant.discountsOffered,
      merchant.deactivationReason || "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "merchants.csv";
    link.click();
  };

  // Deactivation modal
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );
  const [deactivationReason, setDeactivationReason] = useState("");
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  // Approval confirmation modal
  const [selectedMerchantForApproval, setSelectedMerchantForApproval] =
    useState<Merchant | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  // Activation confirmation modal
  const [selectedMerchantForActivation, setSelectedMerchantForActivation] =
    useState<Merchant | null>(null);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  // View Merchant Details modal
  const [viewMerchant, setViewMerchant] = useState<Merchant | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/merchants");
        if (response.ok) {
          const data = await response.json();
          setMerchants(data.merchants);
          setStats(data.stats);
        } else {
          toast.error("Failed to fetch merchants data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading merchants data");
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const calculateStats = (merchantsList: Merchant[]): Stats => {
    const totalMerchants = merchantsList.length;
    const activeMerchants = merchantsList.filter(
      (m) => m.status === "active"
    ).length;
    const pendingApprovals = merchantsList.filter(
      (m) => m.status === "pending"
    ).length;
    const suspendedMerchants = merchantsList.filter(
      (m) => m.status === "suspended"
    ).length;
    return {
      totalMerchants,
      activeMerchants,
      pendingApprovals,
      suspendedMerchants,
    };
  };

  const filteredMerchants = merchants.filter((merchant) => {
    const matchesSearch =
      merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || merchant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fix for statusFilter options to include suspended instead of inactive
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "suspended", label: "Suspended" },
  ];

  const approveMerchant = async (
    merchantId: string,
    status: string = "active"
  ) => {
    try {
      const response = await fetch(`/api/merchants/${merchantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setMerchants((prev) => {
          const updated = prev.map((m) =>
            m.id === merchantId ? { ...m, status } : m
          );
          setStats(calculateStats(updated));
          return updated;
        });
        toast.success("Merchant approved successfully");
        window.dispatchEvent(new CustomEvent("merchantStatsUpdated"));
      } else {
        toast.error("Failed to approve merchant");
      }
    } catch (error) {
      toast.error("Error approving merchant");
    }
  };

  const rejectMerchant = async (merchantId: string) => {
    try {
      const response = await fetch(`/api/merchants/${merchantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "suspended" }),
      });
      if (response.ok) {
        setMerchants((prev) => {
          const updated = prev.map((m) =>
            m.id === merchantId ? { ...m, status: "suspended" } : m
          );
          setStats(calculateStats(updated));
          return updated;
        });
        toast.success("Merchant application rejected");
        window.dispatchEvent(new CustomEvent("merchantStatsUpdated"));
      } else {
        toast.error("Failed to reject merchant");
      }
    } catch (error) {
      toast.error("Error rejecting merchant");
    }
  };

  const toggleMerchantStatus = async (merchantId: string) => {
    const merchant = merchants.find((m) => m.id === merchantId);
    if (!merchant) return;

    const newStatus = merchant.status === "active" ? "suspended" : "active";
    try {
      const response = await fetch(`/api/merchants/${merchantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setMerchants((prev) => {
          const updated = prev.map((m) =>
            m.id === merchantId ? { ...m, status: newStatus } : m
          );
          setStats(calculateStats(updated));
          return updated;
        });
        toast.success("Merchant status updated successfully");
        window.dispatchEvent(new CustomEvent("merchantStatsUpdated"));
      } else {
        toast.error("Failed to update merchant status");
      }
    } catch (error) {
      toast.error("Error updating merchant status");
    }
  };

  const deactivateMerchant = async () => {
    if (!selectedMerchant || !deactivationReason.trim()) {
      toast.error("Please provide a reason for deactivation");
      return;
    }

    try {
      const response = await fetch(
        `/api/merchants/${selectedMerchant.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "suspended", deactivationReason }),
        }
      );
      if (response.ok) {
        setMerchants((prev) => {
          const updated = prev.map((m) =>
            m.id === selectedMerchant.id
              ? { ...m, status: "suspended", deactivationReason }
              : m
          );
          setStats(calculateStats(updated));
          return updated;
        });
        setIsDeactivateDialogOpen(false);
        setDeactivationReason("");
        setSelectedMerchant(null);
        toast.success("Merchant deactivated successfully");
        window.dispatchEvent(new CustomEvent("merchantStatsUpdated"));
      } else {
        toast.error("Failed to deactivate merchant");
      }
    } catch (error) {
      toast.error("Error deactivating merchant");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4AA8FF]"></div>
      </div>
    );
  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          {/* Left Section */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Merchant Management
            </h1>
            <p className="text-gray-600">
              Manage merchant registrations and profiles
            </p>
          </div>

          {/* Right Section */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Badge className="bg-[#FF7A00] text-white animate-pulse w-fit">
              {stats.pendingApprovals} Pending Approvals
            </Badge>
            <Button
              className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00] w-full sm:w-auto"
              onClick={handleExportMerchants}
            >
              <Store className="mr-2 h-4 w-4" />
              Export Merchants
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Merchants
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalMerchants.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">All registered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Active Merchants
              </CardTitle>
              <Store className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeMerchants.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Approvals
              </CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingApprovals.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Suspended Merchants
              </CardTitle>
              <Store className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.suspendedMerchants.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Suspended</p>
            </CardContent>
          </Card>
        </div>

        {/* Merchants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Merchant Directory</CardTitle>
            <CardDescription>
              Manage all merchant profiles and registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dataLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4AA8FF] mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading merchants...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMerchants.map((merchant) => (
                      <TableRow key={merchant.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{merchant.name}</div>
                            <div className="text-sm text-gray-500">
                              {merchant.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{merchant.category}</TableCell>
                        <TableCell>{getStatusBadge(merchant.status)}</TableCell>
                        <TableCell>{merchant.registrationDate}</TableCell>
                        <TableCell>{merchant.totalTransactions}</TableCell>
                        <TableCell>Rs. {merchant.totalRevenue}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {/* View Details */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setViewMerchant(merchant);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Approve/Reject */}
                            {merchant.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMerchantForApproval(merchant);
                                    setIsApproveDialogOpen(true);
                                  }}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => rejectMerchant(merchant.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            {/* Toggle/Deactivate */}
                            {merchant.status !== "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (merchant.status === "active") {
                                    setSelectedMerchant(merchant);
                                    setIsDeactivateDialogOpen(true);
                                  } else {
                                    setSelectedMerchantForActivation(merchant);
                                    setIsActivateDialogOpen(true);
                                  }
                                }}
                              >
                                {merchant.status === "active" ? (
                                  <ToggleRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredMerchants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No merchants found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deactivation Dialog */}
        <Dialog
          open={isDeactivateDialogOpen}
          onOpenChange={setIsDeactivateDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate Merchant</DialogTitle>
              <DialogDescription>
                Please provide a reason for deactivating{" "}
                {selectedMerchant?.name}. This action will disable their ability
                to process transactions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter reason for deactivation..."
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeactivateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={deactivateMerchant}
                className="bg-red-600 hover:bg-red-700"
                disabled={!deactivationReason.trim()}
              >
                Suspend Merchant
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Confirmation Dialog */}
        <Dialog
          open={isApproveDialogOpen}
          onOpenChange={setIsApproveDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Merchant</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve{" "}
                {selectedMerchantForApproval?.name}? This will activate their
                account and allow them to process transactions.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsApproveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedMerchantForApproval) {
                    // Pass status as 'active' explicitly for activation from suspended state
                    approveMerchant(selectedMerchantForApproval.id, "active");
                    setIsApproveDialogOpen(false);
                    setSelectedMerchantForApproval(null);
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Yes, Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activation Confirmation Dialog */}
        <Dialog
          open={isActivateDialogOpen}
          onOpenChange={setIsActivateDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Activate Merchant</DialogTitle>
              <DialogDescription>
                Are you sure you want to activate{" "}
                {selectedMerchantForActivation?.name}? This will allow them to
                process transactions.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsActivateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedMerchantForActivation) {
                    toggleMerchantStatus(selectedMerchantForActivation.id);
                    setIsActivateDialogOpen(false);
                    setSelectedMerchantForActivation(null);
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Yes, Activate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Merchant Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Merchant Details</DialogTitle>
              <DialogDescription>
                Detailed information for{" "}
                <span className="font-semibold text-blue-600">
                  {viewMerchant?.name}
                </span>
              </DialogDescription>
            </DialogHeader>
            {/* Content with scrolling */}
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-blue-600">ID:</strong>{" "}
                {viewMerchant?.id}
              </p>
              <p>
                <strong>Name:</strong> {viewMerchant?.name}
              </p>
              <p>
                <strong>Email:</strong> {viewMerchant?.email}
              </p>
              <p>
                <strong>Phone:</strong> {viewMerchant?.phone}
              </p>
              <p>
                <strong className="text-green-600">Status:</strong>{" "}
                <span
                  className={
                    viewMerchant?.status === "active"
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {viewMerchant?.status}
                </span>
              </p>
              <p>
                <strong>Category:</strong> {viewMerchant?.category}
              </p>
              <p>
                <strong>Address:</strong> {viewMerchant?.address}
              </p>
              <p>
                <strong>Registration Date:</strong>{" "}
                {viewMerchant?.registrationDate}
              </p>
              <p>
                <strong>Total Transactions:</strong>{" "}
                {viewMerchant?.totalTransactions}
              </p>
              <p>
                <strong className="text-indigo-600">Total Revenue:</strong>{" "}
                <span className="font-semibold text-indigo-600">
                  Rs. {viewMerchant?.totalRevenue}
                </span>
              </p>
              <p>
                <strong>Discounts Offered:</strong>{" "}
                {viewMerchant?.discountsOffered}
              </p>
              {viewMerchant?.deactivationReason && (
                <p>
                  <strong>Deactivation Reason:</strong>{" "}
                  {viewMerchant.deactivationReason}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
