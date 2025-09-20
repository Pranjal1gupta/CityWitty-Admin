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

export interface Product {
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export interface Rating {
  user: string;
  rating: number;
  review?: string;
  reply?: string;
  createdAt?: string; // Date as string in API
}

export interface Merchant {
  _id: string;
  applicationId: string;
  businessName: string;
  ownerName: string;
  email: string;
  emailVerified?: boolean;
  phone: string;
  phoneVerified?: boolean;
  password: string;
  category: string;
  city: string;
  address: string;
  whatsapp: string;
  isWhatsappSame: boolean;
  gstNumber: string;
  panNumber: string;
  businessType: string;
  yearsInBusiness: string;
  averageMonthlyRevenue: string;
  discountOffered: string;
  description: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
  };
  agreeToTerms: boolean;

  // 🔥 New Features
  products: Product[];
  logo?: string;
  storeImages?: string[];
  customOffer?: string;
  ribbonTag?: string;
  mapLocation?: string;
  visibility: boolean;
  joinedSince: string; // Dates returned as string from API
  citywittyAssured: boolean;
  ratings: Rating[];
  averageRating?: number;
  tags?: string[];
  status: "pending" | "active" | "suspended";
  deactivationReason?: string;

  // 🔐 Password Reset
  otpCode?: string;
  otpExpiry?: string;

  // ✅ Timestamps
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalMerchants: number;
  activeMerchants: number;
  pendingApprovals: number;
  suspendedMerchants: number;
}

type ModalType = "view" | "approve" | "activate" | "deactivate" | null;

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
  const [deactivationReason, setDeactivationReason] = useState("");

  const pathname = usePathname();

  // Unified modal state
  const [modal, setModal] = useState<{
    type: ModalType;
    merchant: Merchant | null;
  }>({
    type: null,
    merchant: null,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/merchants", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch merchants");
        const data = await res.json();
        setMerchants(data.merchants);
        setStats(data.stats);
      } catch (err) {
        console.error(err);
        toast.error("Error loading merchants data");
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [user, pathname]); // refetch when route changes

  const calculateStats = (merchantsList: Merchant[]): Stats => ({
    totalMerchants: merchantsList.length,
    activeMerchants: merchantsList.filter((m) => m.status === "active").length,
    pendingApprovals: merchantsList.filter((m) => m.status === "pending")
      .length,
    suspendedMerchants: merchantsList.filter((m) => m.status === "suspended")
      .length,
  });

  const filteredMerchants = merchants.filter((merchant) => {
    const matchesSearch =
      (merchant.businessName ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (merchant.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (merchant.category ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || merchant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  // Unified merchant status update helper
  const updateMerchantStatus = async (
    merchantId: string,
    status: string,
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, deactivationReason: reason }),
      });
      if (!res.ok) throw new Error("Failed to update merchant status");
      const updatedMerchant = await res.json();
      setMerchants((prev) => {
        const updated = prev.map((m) =>
          m._id === merchantId ? { ...m, ...updatedMerchant } : m
        );
        setStats(calculateStats(updated));
        return updated;
      });
      toast.success("Merchant status updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Error updating merchant");
    }
  };
  //   const headers = [
  //     "ID",
  //     "Name",
  //     "Email",
  //     "Phone",
  //     "Category",
  //     "Status",
  //     "Registration Date",
  //     "Address",
  //     "Total Transactions",
  //     "Total Revenue",
  //     "Discounts Offered",
  //     "Deactivation Reason",
  //   ];
  //   const csvData = filteredMerchants.map((m) => [
  //     m.id,
  //     m.name,
  //     m.email,
  //     m.phone,
  //     m.category,
  //     m.status,
  //     m.registrationDate,
  //     m.address,
  //     m.totalTransactions,
  //     m.totalRevenue,
  //     m.discountsOffered,
  //     m.deactivationReason || "",
  //   ]);
  //   const csvContent = [headers, ...csvData]
  //     .map((row) =>
  //       row.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(",")
  //     )
  //     .join("\n");
  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = "merchants.csv";
  //   link.click();
  // };

  const handleExportMerchants = () => {
    const headers = [
      "ID",
      "Application ID",
      "Business Name",
      "Owner Name",
      "Email",
      "Email Verified",
      "Phone",
      "Phone Verified",
      "WhatsApp",
      "Is WhatsApp Same",
      "Category",
      "City",
      "Address",
      "GST Number",
      "PAN Number",
      "Business Type",
      "Years In Business",
      "Average Monthly Revenue",
      "Discount Offered",
      "Description",
      "Website",
      "Social Links",
      "Status",
      "Deactivation Reason",
      "Custom Offer",
      "Ribbon Tag",
      "Visibility",
      "Citywitty Assured",
      "Average Rating",
      "Tags",
      "Joined Since",
      "Created At",
      "Updated At",
      "OTP Code",
      "OTP Expiry",
    ];

    const csvData = filteredMerchants.map((m) => [
      m._id,
      m.applicationId,
      m.businessName,
      m.ownerName,
      m.email,
      m.emailVerified ? "Yes" : "No",
      m.phone,
      m.phoneVerified ? "Yes" : "No",
      m.whatsapp,
      m.isWhatsappSame ? "Yes" : "No",
      m.category,
      m.city,
      m.address,
      m.gstNumber,
      m.panNumber,
      m.businessType,
      m.yearsInBusiness,
      m.averageMonthlyRevenue,
      m.discountOffered,
      m.description,
      m.website || "",
      m.socialLinks
        ? Object.entries(m.socialLinks)
            .map(([key, val]) => `${key}: ${val}`)
            .join(" | ")
        : "",
      m.status,
      m.deactivationReason || "",
      m.customOffer || "",
      m.ribbonTag || "",
      m.visibility ? "Yes" : "No",
      m.citywittyAssured ? "Yes" : "No",
      m.averageRating ?? 0,
      m.tags?.join(", ") || "",
      m.joinedSince ? new Date(m.joinedSince).toLocaleDateString() : "",
      m.createdAt ? new Date(m.createdAt).toLocaleString() : "",
      m.updatedAt ? new Date(m.updatedAt).toLocaleString() : "",
      m.otpCode || "",
      m.otpExpiry ? new Date(m.otpExpiry).toLocaleString() : "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) =>
        row.map((f) => `"${String(f ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "merchants.csv";
    link.click();
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Merchant Management
            </h1>
            <p className="text-gray-600">
              Manage merchant registrations and profiles
            </p>
          </div>
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
                      <TableHead>City</TableHead>
                      <TableHead>Joined Since</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMerchants.map((merchant) => (
                      <TableRow key={merchant._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {merchant.businessName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {merchant.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{merchant.category}</TableCell>
                        <TableCell>{getStatusBadge(merchant.status)}</TableCell>
                        <TableCell>{merchant.city}</TableCell>
                        <TableCell>
                          {new Date(merchant.joinedSince).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{merchant.averageRating ?? "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setModal({ type: "view", merchant })
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {merchant.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setModal({ type: "approve", merchant })
                                  }
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateMerchantStatus(
                                      merchant._id,
                                      "suspended"
                                    )
                                  }
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}

                            {merchant.status !== "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setModal({
                                    type:
                                      merchant.status === "active"
                                        ? "deactivate"
                                        : "activate",
                                    merchant,
                                  })
                                }
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

        {/* Modals */}
        {modal.type === "deactivate" && modal.merchant && (
          <Dialog
            open
            onOpenChange={() => setModal({ type: null, merchant: null })}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deactivate Merchant</DialogTitle>
                <DialogDescription>
                  Provide a reason for deactivating{" "}
                  {modal.merchant.businessName}. This will suspend their
                  account.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Enter reason..."
                rows={4}
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
              />
              <DialogFooter className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setModal({ type: null, merchant: null })}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  disabled={!deactivationReason.trim()}
                  onClick={() => {
                    updateMerchantStatus(
                      modal.merchant!._id,
                      "suspended",
                      deactivationReason
                    );
                    setDeactivationReason("");
                    setModal({ type: null, merchant: null });
                  }}
                >
                  Suspend Merchant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {modal.type === "approve" && modal.merchant && (
          <Dialog
            open
            onOpenChange={() => setModal({ type: null, merchant: null })}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Merchant</DialogTitle>
                <DialogDescription>
                  Approve {modal.merchant.businessName} to activate their
                  account?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setModal({ type: null, merchant: null })}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    updateMerchantStatus(modal.merchant!._id, "active");
                    setModal({ type: null, merchant: null });
                  }}
                >
                  Yes, Approve
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {modal.type === "activate" && modal.merchant && (
          <Dialog
            open
            onOpenChange={() => setModal({ type: null, merchant: null })}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Activate Merchant</DialogTitle>
                <DialogDescription>
                  Activate {modal.merchant.businessName} to allow transactions?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setModal({ type: null, merchant: null })}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    updateMerchantStatus(modal.merchant!._id, "active");
                    setModal({ type: null, merchant: null });
                  }}
                >
                  Yes, Activate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {modal.type === "view" && modal.merchant && (
          <Dialog
            open
            onOpenChange={() => setModal({ type: null, merchant: null })}
          >
            <DialogContent className="max-h-[80vh] overflow-y-auto w-[600px]">
              <DialogHeader>
                <DialogTitle>Merchant Details</DialogTitle>
                <DialogDescription>
                  Complete information for{" "}
                  <strong className="text-black uppercase">
                    {modal.merchant.businessName}
                  </strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 text-sm">
                {/* <p>
                  <strong>ID:</strong>{" "}
                  {modal.merchant._id}
                </p> */}
                <p>
                  <strong>Application ID:</strong>{" "}
                  {modal.merchant.applicationId}
                </p>
                <p>
                  <strong>Status:</strong> {modal.merchant.status}
                </p>
                <p>
                  <strong>Business Name:</strong> {modal.merchant.businessName}
                </p>
                <p>
                  <strong>Owner Name:</strong> {modal.merchant.ownerName}
                </p>
                <p>
                  <strong>Email:</strong> {modal.merchant.email} (
                  {modal.merchant.emailVerified ? "Verified" : "Not Verified"})
                </p>
                <p>
                  <strong>Phone:</strong> {modal.merchant.phone} (
                  {modal.merchant.phoneVerified ? "Verified" : "Not Verified"})
                </p>
                <p>
                  <strong>Category:</strong> {modal.merchant.category}
                </p>
                <p>
                  <strong>City:</strong> {modal.merchant.city}
                </p>
                <p>
                  <strong>Address:</strong> {modal.merchant.address}
                </p>
                <p>
                  <strong>WhatsApp:</strong> {modal.merchant.whatsapp}{" "}
                  {modal.merchant.isWhatsappSame ? "(Same as phone)" : ""}
                </p>
                <p>
                  <strong>GST Number:</strong> {modal.merchant.gstNumber}
                </p>
                <p>
                  <strong>PAN Number:</strong> {modal.merchant.panNumber}
                </p>
                <p>
                  <strong>Business Type:</strong> {modal.merchant.businessType}
                </p>
                <p>
                  <strong>Years in Business:</strong>{" "}
                  {modal.merchant.yearsInBusiness}
                </p>
                <p>
                  <strong>Average Monthly Revenue:</strong>{" "}
                  {modal.merchant.averageMonthlyRevenue}
                </p>
                <p>
                  <strong>Discount Offered:</strong>{" "}
                  {modal.merchant.discountOffered}
                </p>
                <p>
                  <strong>Description:</strong> {modal.merchant.description}
                </p>
                <p>
                  <strong>Website:</strong> {modal.merchant.website || "N/A"}
                </p>
                <p>
                  <strong>Social Links:</strong>{" "}
                  {JSON.stringify(modal.merchant.socialLinks)}
                </p>
                <p>
                  <strong>Custom Offer:</strong> {modal.merchant.customOffer}
                </p>
                {/* <p>
                  <strong>Ribbon Tag:</strong> {modal.merchant.ribbonTag}
                </p> */}
                <p>
                  <strong>Map Location:</strong> {modal.merchant.mapLocation}
                </p>
                <p>
                  <strong>Visibility:</strong>{" "}
                  {modal.merchant.visibility ? "Visible" : "Hidden"}
                </p>
                <p>
                  <strong>Citywitty Assured:</strong>{" "}
                  {modal.merchant.citywittyAssured ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Average Rating:</strong>{" "}
                  {modal.merchant.averageRating}
                </p>
                <p>
                  <strong>Tags:</strong> {modal.merchant.tags?.join(", ")}
                </p>

                <p>
                  <strong>Products:</strong>{" "}
                  {JSON.stringify(modal.merchant.products)}
                </p>
                {/* <p>
                  <strong>Logo:</strong> {modal.merchant.logo || "N/A"}
                </p> */}
                <p>
                  <strong>Joined Since:</strong>{" "}
                  {new Date(modal.merchant.joinedSince).toLocaleDateString()}
                </p>
                {/* <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(modal.merchant.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Updated At:</strong>{" "}
                  {new Date(modal.merchant.updatedAt).toLocaleString()}
                </p> */}
                {modal.merchant.deactivationReason && (
                  <p>
                    <strong>Deactivation Reason:</strong>{" "}
                    {modal.merchant.deactivationReason}
                  </p>
                )}
                {/* <p>
                  <strong>OTP Code:</strong> {modal.merchant.otpCode || "N/A"}
                </p>
                <p>
                  <strong>OTP Expiry:</strong>{" "}
                  {modal.merchant.otpExpiry
                    ? new Date(modal.merchant.otpExpiry).toLocaleString()
                    : "N/A"}
                </p> */}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setModal({ type: null, merchant: null })}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
