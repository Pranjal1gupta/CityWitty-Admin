import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { format } from "date-fns";

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

interface AdminViewModalProps {
  admin: Admin | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminViewModal({
  admin,
  isOpen,
  onClose,
}: AdminViewModalProps) {
  if (!admin) return null;

  const isLocked =
    admin.accountLockedUntil &&
    new Date(admin.accountLockedUntil) > new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto max-w-2xl w-full">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-xl font-bold">Admin Details</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Complete information for <strong className="text-black">{admin.username}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <section className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Unique ID</p>
                <p className="text-sm font-medium text-gray-900">{admin.uniqueId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Username</p>
                <p className="text-sm font-medium text-gray-900">{admin.username}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                <p className="text-sm font-medium text-gray-900">{admin.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                <p className="text-sm font-medium text-gray-900">{admin.phone || "N/A"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                <p className="text-sm font-medium text-gray-900">{admin.address || "N/A"}</p>
              </div>
            </div>
          </section>

          {/* Role & Access */}
          <section className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              Role & Access
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Role</p>
                <Badge className={`mt-1 ${admin.role === "superadmin" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                  {admin.role}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Super Admin</p>
                <Badge className={`mt-1 ${admin.isSuperAdmin ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                  {admin.isSuperAdmin ? "Yes" : "No"}
                </Badge>
              </div>
              {admin.permissions && admin.permissions.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {admin.permissions.map((perm, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Account Status */}
          <section className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Account Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                <Badge className={`mt-1 ${admin.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {admin.status}
                </Badge>
              </div>
              {isLocked && (
                <>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Locked Until</p>
                    <p className="text-sm font-medium text-orange-600">
                      {format(new Date(admin.accountLockedUntil!), "PPp")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Lock Reason</p>
                    <p className="text-sm font-medium text-gray-900">{admin.accountLockReason || "N/A"}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Failed Attempts</p>
                <p className={`text-sm font-medium ${(admin.failedLoginAttempts || 0) > 5 ? "text-red-600" : "text-gray-900"}`}>
                  {admin.failedLoginAttempts || 0}
                </p>
              </div>
            </div>
          </section>

          {/* Security & Login Activity */}
          <section className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              Security & Login Activity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Last Login</p>
                <p className="text-sm font-medium text-gray-900">
                  {admin.lastLogin ? format(new Date(admin.lastLogin), "PPp") : "Never"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Last Login IP</p>
                <p className="text-sm font-medium text-gray-900">{admin.lastLoginIP || "N/A"}</p>
              </div>
            </div>
          </section>

          {/* Audit Information */}
          <section className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              Audit Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Created At</p>
                <p className="text-sm font-medium text-gray-900">
                  {admin.createdAt ? format(new Date(admin.createdAt), "PPp") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Created By</p>
                <p className="text-sm font-medium text-gray-900">{admin.createdBy || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Updated At</p>
                <p className="text-sm font-medium text-gray-900">
                  {admin.updatedAt ? format(new Date(admin.updatedAt), "PPp") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Updated By</p>
                <p className="text-sm font-medium text-gray-900">{admin.updatedBy || "N/A"}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
