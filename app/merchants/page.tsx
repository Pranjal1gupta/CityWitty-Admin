"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Merchant, Stats, ModalType } from "@/app/types/Merchant";
import MerchantStats from "@/components/merchants/MerchantStats";
import MerchantTable from "@/components/merchants/MerchantTable";
import MerchantViewModal from "@/components/merchants/MerchantViewModal";
import MerchantActionModals from "@/components/merchants/MerchantActionModals";
import { Badge } from "@/components/ui/badge";

export default function MerchantsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<Stats>({
    totalMerchants: 0,
    activeMerchants: 0,
    pendingApprovals: 0,
    suspendedMerchants: 0,
  });

  const pathname = usePathname();

  // Unified modal state
  const [modal, setModal] = useState<{
    type: ModalType;
    merchant: Merchant | null;
    newVisibility?: boolean;
    newStatus?: string;
  }>({
    type: null,
    merchant: null,
  });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          search: searchTerm,
          status: statusFilter,
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
        });
        const res = await fetch(`/api/merchants?${params}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch merchants");
        const data = await res.json();
        setMerchants(data.merchants);
        setTotalCount(data.totalCount);
        setStats(data.stats);
      } catch (err) {
        console.error(err);
        toast.error("Error loading merchants data");
      } finally {
        setDataLoading(false);
      }
    };

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    fetchData();
    // const interval = setInterval(() => {
    //   fetchData();
    // }, 3000);

    // return () => clearInterval(interval);
  }, [user, pathname, searchTerm, statusFilter, currentPage, rowsPerPage]); // refetch when filters or pagination change

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
        body: JSON.stringify({ status, suspensionReason: reason }),
      });
      if (!res.ok) throw new Error("Failed to update merchant status");
      const updatedMerchant = await res.json();
      setMerchants((prev) => {
        const updated = prev.map((m) =>
          m._id === merchantId ? { ...m, ...updatedMerchant } : m
        );
        return updated;
      });
      toast.success("Merchant status updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Error updating merchant");
    }
  };



  // Unified merchant limits update helper
  const updateMerchantLimits = async (
    merchantId: string,
    limits: { ListingLimit?: number; totalGraphics?: number; totalReels?: number; isWebsite?: boolean; totalPodcast?: number },
    secretCode: string
  ) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/limits`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...limits, 
          secretCode,
          // Allow bypass when called from package management (secretCode is empty)
          bypassSecretCode: secretCode === ""
        }),
      });
      if (!res.ok) throw new Error("Failed to update merchant limits");
      const updatedMerchant = await res.json();
      setMerchants((prev) => {
        const updated = prev.map((m) =>
          m._id === merchantId ? { ...m, ...updatedMerchant } : m
        );
        return updated;
      });
      toast.success("Merchant limits updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Error updating merchant limits");
    }
  };

  // Unified merchant statuses update helper
  const updateMerchantStatuses = async (
    merchantId: string,
    statuses: { citywittyAssured?: boolean; isVerified?: boolean; isPremiumSeller?: boolean; isTopMerchant?: boolean }
  ) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/statuses`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(statuses),
      });
      if (!res.ok) throw new Error("Failed to update merchant statuses");
      const updatedMerchant = await res.json();
      setMerchants((prev) => {
        const updated = prev.map((m) =>
          m._id === merchantId ? { ...m, ...updatedMerchant } : m
        );
        return updated;
      });
      toast.success("Merchant statuses updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Error updating merchant statuses");
    }
  };

  // Unified merchant visibility update helper
  const updateMerchantVisibility = async (
    merchantId: string,
    visibility: boolean
  ) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/statuses`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility }),
      });
      if (!res.ok) throw new Error("Failed to update merchant visibility");
      const updatedMerchant = await res.json();
      setMerchants((prev) => {
        const updated = prev.map((m) =>
          m._id === merchantId ? { ...m, ...updatedMerchant } : m
        );
        return updated;
      });
      toast.success("Merchant visibility updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Error updating merchant visibility");
    }
  };

  // Unified merchant purchased package update helper
  const updatePurchasedPackage = async (
    merchantId: string,
    packageData: { variantName: string; purchaseDate: string; expiryDate: string; transactionId: string }
  ) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/purchased-package`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchasedPackage: packageData }),
      });
      if (!res.ok) throw new Error("Failed to update purchased package");
      const updatedMerchant = await res.json();
      setMerchants((prev) => {
        const updated = prev.map((m) =>
          m._id === merchantId ? { ...m, ...updatedMerchant } : m
        );
        return updated;
      });
      toast.success("Purchased package updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Error updating purchased package");
    }
  };

  // Unified merchant onboarding agent update helper
  const updateOnboardingAgent = async (
    merchantId: string,
    agentData: { agentId: string; agentName: string }
  ) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/onboarding-agent`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingAgent: agentData }),
      });
      if (!res.ok) throw new Error("Failed to update onboarding agent");
      const updatedMerchant = await res.json();
      setMerchants((prev) => {
        const updated = prev.map((m) =>
          m._id === merchantId ? { ...m, ...updatedMerchant } : m
        );
        return updated;
      });
      toast.success("Onboarding agent updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Error updating onboarding agent");
    }
  };

  // Unified merchant digital support update helper
  const updateDigitalSupport = async (
    merchantId: string,
    digitalSupportData: {
      ds_graphics?: any[];
      ds_reel?: any[];
      ds_weblog?: any[];
      podcastLog?: any[];
    }
  ) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/digital-support`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ digitalSupportData }),
      });
      if (!res.ok) throw new Error("Failed to update digital support assets");
      const response = await res.json();
      const updatedMerchant = response.data || response;
      setMerchants((prev) => {
        const updated = prev.map((m) =>
          m._id === merchantId ? { ...m, ...updatedMerchant } : m
        );
        return updated;
      });
      toast.success("Digital support assets added successfully");
    } catch (err: any) {
      toast.error(err.message || "Error adding digital support assets");
    }
  };

  const deleteMerchant = async (merchantId: string, secretCode: string) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretCode }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to delete merchant");
      }
      setMerchants((prev) => prev.filter((m) => m._id !== merchantId));
      setTotalCount((prev) => Math.max(prev - 1, 0));
      setDataLoading(true);
      await fetchData();
      toast.success("Merchant deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Error deleting merchant");
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
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Merchants</h1>
              <p className="text-muted-foreground">
                Manage and monitor all merchant accounts
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Badge className="bg-[#ff1e00] text-white w-fit">
              {stats.pendingApprovals} Pending Approvals
            </Badge>
            <Button
              className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00] w-full sm:w-auto"
              onClick={async () => {}}
            >
              <Store className="mr-2 h-4 w-4" />
              Export Merchants
            </Button>
          </div>
          </div>

          <MerchantStats stats={stats} />
          <MerchantTable
            merchants={merchants}
            dataLoading={dataLoading}
            onSetModal={setModal}
            onUpdateMerchantStatus={updateMerchantStatus}
            onUpdateMerchantVisibility={updateMerchantVisibility}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalCount={totalCount}
          />
          <MerchantViewModal
            merchant={modal.merchant}
            isOpen={modal.type === "view"}
            onClose={() => setModal({ type: null, merchant: null })}
          />
          <MerchantActionModals
            modal={modal}
            onClose={() => setModal({ type: null, merchant: null })}
            onUpdateMerchantStatus={updateMerchantStatus}
            onUpdateMerchantVisibility={updateMerchantVisibility}
            onUpdateMerchantLimits={updateMerchantLimits}
            onUpdateMerchantStatuses={updateMerchantStatuses}
            onUpdatePurchasedPackage={updatePurchasedPackage}
            onUpdateOnboardingAgent={updateOnboardingAgent}
            onDeleteMerchant={deleteMerchant}
            onUpdateDigitalSupport={updateDigitalSupport}
          />
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}

