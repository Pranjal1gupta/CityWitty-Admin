"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
      } catch (err) {
        console.error(err);
        toast.error("Error loading merchants data");
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 3000);

    return () => clearInterval(interval);

  }, [user, pathname]); // refetch when route changes

  const stats = useMemo((): Stats => ({
    totalMerchants: merchants.length,
    activeMerchants: merchants.filter((m) => m.status === "active").length,
    pendingApprovals: merchants.filter((m) => m.status === "pending").length,
    suspendedMerchants: merchants.filter((m) => m.status === "suspended").length,
  }), [merchants]);

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

  // Unified merchant visibility update helper
  const updateMerchantVisibility = async (
    merchantId: string,
    visibility: boolean
  ) => {
    try {
      const res = await fetch(`/api/merchants/${merchantId}/visibility`, {
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
        body: JSON.stringify({ ...limits, secretCode }),
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
              <h1 className="text-3xl font-bold tracking-tight">Merchants</h1>
              <p className="text-muted-foreground">
                Manage and monitor all merchant accounts
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Badge className="bg-[#FF7A00] text-white animate-pulse w-fit">
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
          />
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}

