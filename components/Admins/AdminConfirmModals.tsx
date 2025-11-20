import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Crown } from "lucide-react";
import { useState } from "react";

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

interface DeleteConfirmModalProps {
  isOpen: boolean;
  admin: Admin | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (secretCode: string) => Promise<void>;
}

export function DeleteConfirmModal({
  isOpen,
  admin,
  isLoading,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (!secretCode.trim()) {
      setError("Secret code is required");
      return;
    }
    try {
      await onConfirm(secretCode);
      setSecretCode("");
      setError("");
    } catch (err: any) {
      setError(err.message || "Invalid secret code");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSecretCode("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Admin</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{admin?.username}</strong>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-red-600 mt-0.5">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-red-800">
                <strong>Warning:</strong> This will permanently delete this admin and cannot be recovered.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Admin Secret Code</label>
            <Input
              type="password"
              placeholder="Enter secret code to confirm deletion"
              value={secretCode}
              onChange={(e) => {
                setSecretCode(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading || !secretCode.trim()}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface StatusChangeConfirmModalProps {
  isOpen: boolean;
  admin: Admin | null;
  newStatus: "active" | "inactive" | undefined;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function StatusChangeConfirmModal({
  isOpen,
  admin,
  newStatus,
  isLoading,
  onClose,
  onConfirm,
}: StatusChangeConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Status Change</DialogTitle>
          <DialogDescription>
            Are you sure you want to change the status of{" "}
            <strong>{admin?.username}</strong> from{" "}
            <strong>{admin?.status}</strong> to <strong>{newStatus}</strong>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            No, Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
          >
            {isLoading ? "Updating..." : "Yes, Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface LockToggleConfirmModalProps {
  isOpen: boolean;
  admin: Admin | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LockToggleConfirmModal({
  isOpen,
  admin,
  isLoading,
  onClose,
  onConfirm,
}: LockToggleConfirmModalProps) {
  const isLocked = admin?.accountLockedUntil && new Date(admin.accountLockedUntil) > new Date();
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Account Lock Change</DialogTitle>
          <DialogDescription>
            Are you sure you want to {isLocked ? "unlock" : "lock"} the account of{" "}
            <strong>{admin?.username}</strong>?
            {isLocked ? " This will allow the admin to log in again." : " This will prevent the admin from logging in for 24 hours."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            No, Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
          >
            {isLoading ? "Updating..." : "Yes, Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ResetAttemptsConfirmModalProps {
  isOpen: boolean;
  admin: Admin | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetAttemptsConfirmModal({
  isOpen,
  admin,
  isLoading,
  onClose,
  onConfirm,
}: ResetAttemptsConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Failed Login Attempts</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset the failed login attempts for{" "}
            <strong>{admin?.username}</strong>? This will set the counter back to 0.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            No, Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
          >
            {isLoading ? "Resetting..." : "Yes, Reset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SuperAdminToggleConfirmModalProps {
  isOpen: boolean;
  admin: Admin | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface StatusChangeWithLockModalProps {
  isOpen: boolean;
  admin: Admin | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (accountLockReason: string, accountLockedUntil?: Date) => void;
}

export function StatusChangeWithLockModal({
  isOpen,
  admin,
  isLoading,
  onClose,
  onConfirm,
}: StatusChangeWithLockModalProps) {
  const [accountLockReason, setAccountLockReason] = useState("");
  const [accountLockedUntil, setAccountLockedUntil] = useState("");
  const [errors, setErrors] = useState<{ reason?: string; date?: string }>({});

  const handleConfirm = () => {
    const newErrors: { reason?: string; date?: string } = {};

    if (!accountLockReason.trim()) {
      newErrors.reason = "Lock reason is required";
    }

    if (accountLockedUntil) {
      const selectedDate = new Date(accountLockedUntil);
      const now = new Date();
      if (selectedDate <= now) {
        newErrors.date = "Lock date must be in the future";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm(accountLockReason, accountLockedUntil ? new Date(accountLockedUntil) : undefined);
    setAccountLockReason("");
    setAccountLockedUntil("");
    setErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAccountLockReason("");
      setAccountLockedUntil("");
      setErrors({});
      onClose();
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deactivate Admin Account</DialogTitle>
          <DialogDescription>
            You are about to deactivate <strong>{admin?.username}</strong>&apos;s account. 
            Please provide the lock reason. Optionally, you can set a date until which the account should remain locked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Lock Reason</label>
            <Input
              placeholder="e.g., Security concern, Violation of policies, etc."
              value={accountLockReason}
              onChange={(e) => {
                setAccountLockReason(e.target.value);
                if (errors.reason) setErrors({ ...errors, reason: undefined });
              }}
              disabled={isLoading}
              className={errors.reason ? "border-red-500" : ""}
            />
            {errors.reason && (
              <p className="text-xs text-red-600">{errors.reason}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Lock Until (Date & Time) <span className="text-gray-500 font-normal">(Optional)</span></label>
            <Input
              type="datetime-local"
              value={accountLockedUntil}
              onChange={(e) => {
                setAccountLockedUntil(e.target.value);
                if (errors.date) setErrors({ ...errors, date: undefined });
              }}
              disabled={isLoading}
              min={getMinDateTime()}
              className={errors.date ? "border-red-500" : ""}
            />
            {errors.date && (
              <p className="text-xs text-red-600">{errors.date}</p>
            )}
            <p className="text-xs text-gray-500">If not specified, the account will remain locked indefinitely until manually reactivated.</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
          >
            {isLoading ? "Updating..." : "Deactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SuperAdminToggleConfirmModal({
  isOpen,
  admin,
  isLoading,
  onClose,
  onConfirm,
}: SuperAdminToggleConfirmModalProps) {
  const [secretCode, setSecretCode] = useState("");
  const [secretCodeError, setSecretCodeError] = useState("");
  
  const isSuperAdmin = admin?.isSuperAdmin;
  const currentRole = admin?.role || "admin";
  const newRole = isSuperAdmin ? "admin" : "superadmin";
  const newIsSuperAdmin = !isSuperAdmin;

  const handleSecretCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecretCode(e.target.value);
    setSecretCodeError("");
  };

  const handleConfirm = async () => {
    if (!secretCode) {
      setSecretCodeError("Secret code is required");
      return;
    }

    try {
      const response = await fetch("/api/verify-admin-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: secretCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSecretCodeError(data.error || "Invalid secret code");
        return;
      }

      setSecretCode("");
      setSecretCodeError("");
      onConfirm();
    } catch (error) {
      setSecretCodeError("Error verifying code");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSecretCode("");
      setSecretCodeError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className={`h-5 w-5 ${isSuperAdmin ? "text-yellow-600" : "text-gray-600"}`} />
            Confirm Super Admin Status Change
          </DialogTitle>
          <DialogDescription>
            You are about to change the admin privileges for <strong>{admin?.username}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-gray-900">Changes to be applied:</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Super Admin Status:</span>
                <div className="flex items-center gap-2">
                  <Badge variant={isSuperAdmin ? "default" : "secondary"} className="text-xs">
                    {isSuperAdmin ? "Yes" : "No"}
                  </Badge>
                  <span className="text-gray-400">→</span>
                  <Badge variant={newIsSuperAdmin ? "default" : "secondary"} className="text-xs bg-yellow-100 text-yellow-800">
                    {newIsSuperAdmin ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Role:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {currentRole}
                  </Badge>
                  <span className="text-gray-400">→</span>
                  <Badge variant="outline" className={`text-xs ${newRole === "superadmin" ? "border-yellow-300 bg-yellow-50 text-yellow-700" : ""}`}>
                    {newRole}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 mt-0.5">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <strong>Important:</strong> {isSuperAdmin ? "Removing" : "Granting"} super admin privileges will {isSuperAdmin ? "limit" : "expand"} this user&apos;s access to system administration features.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Admin Secret Code</label>
            <Input
              type="password"
              placeholder="Enter secret code"
              value={secretCode}
              onChange={handleSecretCodeChange}
              disabled={isLoading}
              className={secretCodeError ? "border-red-500" : ""}
            />
            {secretCodeError && (
              <p className="text-xs text-red-600">{secretCodeError}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !secretCode}
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00] hover:from-[#3A8AFF] hover:to-[#FF6A00]"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Confirm Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
