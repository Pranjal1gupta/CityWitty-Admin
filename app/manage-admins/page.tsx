"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { AdminsStatsCards } from "@/components/Admins/AdminsStatsCards";
import { AdminsTable } from "@/components/Admins/AdminsTable";
import {
  DeleteConfirmModal,
  StatusChangeConfirmModal,
  ResetAttemptsConfirmModal,
  SuperAdminToggleConfirmModal,
  StatusChangeWithLockModal,
} from "@/components/Admins/AdminConfirmModals";
import AdminViewModal from "@/components/Admins/AdminViewModal";
import { AdminFormModal } from "@/components/Admins/AdminFormModal";
import { EditAdminModal } from "@/components/Admins/EditAdminModal";

interface Admin {
  _id: string;
  uniqueId: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  role: "admin" | "superadmin";
  status: "active" | "inactive";
  avatar?: string;
  isSuperAdmin?: boolean;
  accountLockedUntil?: Date;
  accountLockReason?: string;
  lastLogin?: Date;
  lastLoginIP?: string;
  failedLoginAttempts?: number;
  permissions?: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  meta?: Record<string, any>;
}

interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  inactiveAdmins: number;
  totalSuperAdmins?: number;
}

type ModalType = "delete" | "statusChange" | "statusChangeWithLock" | "resetAttempts" | "superAdminToggle" | null;

export default function AdminsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "superadmin">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalAdmins: 0,
    activeAdmins: 0,
    inactiveAdmins: 0,
  });

  const [modal, setModal] = useState<{
    type: ModalType;
    admin: Admin | null;
    newStatus?: "active" | "inactive";
  }>({
    type: null,
    admin: null,
  });

  const [viewAdmin, setViewAdmin] = useState<Admin | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState<Admin | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const fetchAdmins = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
      });
      const res = await fetch(`/api/admin?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch admins");
      const data = await res.json();
      setAdmins(data.admins || []);
      setTotalCount(data.totalCount || 0);
      setStats(data.stats || {
        totalAdmins: 0,
        activeAdmins: 0,
        inactiveAdmins: 0,
      });
    } catch (err) {
      console.error(err);
      toast.error("Error loading admins data");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    fetchAdmins();
  }, [user, pathname, searchTerm, statusFilter, roleFilter, currentPage, rowsPerPage]);

  const handleStatusChange = (admin: Admin, newStatus: "active" | "inactive") => {
    if (newStatus === "inactive") {
      setModal({
        type: "statusChangeWithLock",
        admin,
        newStatus,
      });
    } else {
      setModal({
        type: "statusChange",
        admin,
        newStatus,
      });
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!modal.admin || !modal.newStatus) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/${modal.admin._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: modal.newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update admin status");
      setAdmins((prev) =>
        prev.map((a) =>
          a._id === modal.admin?._id ? { ...a, status: modal.newStatus! } : a
        )
      );
      toast.success("Admin status updated successfully");
      setModal({ type: null, admin: null });
    } catch (err: any) {
      toast.error(err.message || "Error updating admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmStatusChangeWithLock = async (
    accountLockReason: string,
    accountLockedUntil?: Date
  ) => {
    if (!modal.admin || !modal.newStatus) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/${modal.admin._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: modal.newStatus,
          accountLockReason,
          ...(accountLockedUntil && { accountLockedUntil }),
        }),
      });
      if (!res.ok) throw new Error("Failed to update admin status");
      setAdmins((prev) =>
        prev.map((a) =>
          a._id === modal.admin?._id
            ? {
                ...a,
                status: modal.newStatus!,
                accountLockReason,
                ...(accountLockedUntil && { accountLockedUntil }),
              }
            : a
        )
      );
      toast.success("Admin deactivated successfully");
      setModal({ type: null, admin: null });
    } catch (err: any) {
      toast.error(err.message || "Error updating admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (admin: Admin) => {
    setViewAdmin(admin);
    setShowViewModal(true);
  };

  const handleEdit = (admin: Admin) => {
    setEditAdmin(admin);
    setShowEditModal(true);
  };

  const handleDeleteClick = (admin: Admin) => {
    setModal({ type: "delete", admin });
  };

  const handleConfirmDelete = async (secretCode: string) => {
    if (!modal.admin) throw new Error("No admin selected");
    
    setActionLoading(true);
    try {
      const verifyRes = await fetch("/api/verify-admin-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: secretCode }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || "Invalid secret code");
      }

      const res = await fetch(`/api/admin/${modal.admin._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete admin");
      setAdmins((prev) => prev.filter((a) => a._id !== modal.admin?._id));
      setTotalCount((prev) => Math.max(prev - 1, 0));
      toast.success("Admin deleted successfully");
      setModal({ type: null, admin: null });
    } catch (err: any) {
      throw new Error(err.message || "Error deleting admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetAttempts = (admin: Admin) => {
    setModal({ type: "resetAttempts", admin });
  };

  const handleConfirmResetAttempts = async () => {
    if (!modal.admin) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/${modal.admin._id}/reset-attempts`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Failed to reset failed attempts");
      setAdmins((prev) =>
        prev.map((a) =>
          a._id === modal.admin?._id ? { ...a, failedLoginAttempts: 0 } : a
        )
      );
      toast.success("Failed login attempts reset successfully");
      setModal({ type: null, admin: null });
    } catch (err: any) {
      toast.error(err.message || "Error resetting attempts");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuperAdminToggle = (admin: Admin) => {
    setModal({ type: "superAdminToggle", admin });
  };

  const handleConfirmSuperAdminToggle = async () => {
    if (!modal.admin) return;
    setActionLoading(true);
    try {
      const newIsSuperAdmin = !modal.admin.isSuperAdmin;
      const newRole = newIsSuperAdmin ? "superadmin" : "admin";
      const res = await fetch(`/api/admin/${modal.admin._id}/super-admin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuperAdmin: newIsSuperAdmin, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update super admin status");
      setAdmins((prev) =>
        prev.map((a) =>
          a._id === modal.admin?._id ? { ...a, isSuperAdmin: newIsSuperAdmin, role: newRole } : a
        )
      );
      toast.success(`Admin ${newIsSuperAdmin ? "promoted to super admin" : "demoted from super admin"} successfully`);
      setModal({ type: null, admin: null });
    } catch (err: any) {
      toast.error(err.message || "Error updating super admin status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAdmin = async (formData: {
    username: string;
    email: string;
    role: "admin" | "superadmin";
    secretKey: string;
  }) => {
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create admin");
      }
      const newAdmin = await res.json();
      setAdmins((prev) => [newAdmin.admin || newAdmin, ...prev]);
      setTotalCount((prev) => prev + 1);
      toast.success("Admin created successfully");
      setShowFormModal(false);
    } catch (err: any) {
      toast.error(err.message || "Error creating admin");
      throw err;
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAdmin = async (formData: {
    username: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    if (!editAdmin) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/admin/${editAdmin._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update admin");
      }
      const updatedAdmin = await res.json();
      setAdmins((prev) =>
        prev.map((a) => (a._id === editAdmin._id ? updatedAdmin.admin : a))
      );
      toast.success("Admin profile updated successfully");
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(err.message || "Error updating admin");
      throw err;
    } finally {
      setFormLoading(false);
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
      <TooltipProvider>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Manage Admins</h1>
              <p className="text-sm text-gray-600">
                Manage admin users and their access levels
              </p>
            </div>
            <Button
              onClick={() => setShowFormModal(true)}
              className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
              disabled={!user?.isSuperAdmin}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </div>

          <AdminsStatsCards stats={stats} />

          <AdminsTable
            admins={admins}
            dataLoading={dataLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalCount={totalCount}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onResetAttempts={handleResetAttempts}
            onSuperAdminToggle={handleSuperAdminToggle}
            onDelete={handleDeleteClick}
            onStatusChange={handleStatusChange}
            isSuperAdmin={user?.isSuperAdmin || false}
          />

          <StatusChangeConfirmModal
            isOpen={modal.type === "statusChange"}
            admin={modal.admin}
            newStatus={modal.newStatus}
            isLoading={actionLoading}
            onClose={() => setModal({ type: null, admin: null })}
            onConfirm={handleConfirmStatusChange}
          />

          <StatusChangeWithLockModal
            isOpen={modal.type === "statusChangeWithLock"}
            admin={modal.admin}
            isLoading={actionLoading}
            onClose={() => setModal({ type: null, admin: null })}
            onConfirm={handleConfirmStatusChangeWithLock}
          />

          <DeleteConfirmModal
            isOpen={modal.type === "delete"}
            admin={modal.admin}
            isLoading={actionLoading}
            onClose={() => setModal({ type: null, admin: null })}
            onConfirm={handleConfirmDelete}
          />

          <ResetAttemptsConfirmModal
            isOpen={modal.type === "resetAttempts"}
            admin={modal.admin}
            isLoading={actionLoading}
            onClose={() => setModal({ type: null, admin: null })}
            onConfirm={handleConfirmResetAttempts}
          />

          <SuperAdminToggleConfirmModal
            isOpen={modal.type === "superAdminToggle"}
            admin={modal.admin}
            isLoading={actionLoading}
            onClose={() => setModal({ type: null, admin: null })}
            onConfirm={handleConfirmSuperAdminToggle}
          />

          <AdminViewModal
            admin={viewAdmin}
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setViewAdmin(null);
            }}
          />

          <AdminFormModal
            isOpen={showFormModal}
            isLoading={formLoading}
            onClose={() => setShowFormModal(false)}
            onSubmit={handleCreateAdmin}
          />

          <EditAdminModal
            admin={editAdmin}
            isOpen={showEditModal}
            isLoading={formLoading}
            onClose={() => {
              setShowEditModal(false);
              setEditAdmin(null);
            }}
            onSubmit={handleEditAdmin}
          />
        </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}
