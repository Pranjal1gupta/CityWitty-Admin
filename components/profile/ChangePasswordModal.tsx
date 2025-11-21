"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passwordForm: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  showPasswordConfirm: boolean;
  onShowPasswordConfirmChange: (show: boolean) => void;
  onPasswordFormChange: (form: any) => void;
  onShowCurrentPasswordChange: (show: boolean) => void;
  onShowNewPasswordChange: (show: boolean) => void;
  onShowConfirmPasswordChange: (show: boolean) => void;
  onPasswordChange: (e: React.FormEvent) => void;
  onPasswordConfirm: () => Promise<void>;
}

export default function ChangePasswordModal({
  open,
  onOpenChange,
  passwordForm,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  showPasswordConfirm,
  onShowPasswordConfirmChange,
  onPasswordFormChange,
  onShowCurrentPasswordChange,
  onShowNewPasswordChange,
  onShowConfirmPasswordChange,
  onPasswordChange,
  onPasswordConfirm,
}: ChangePasswordModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Update your account password. You&apos;ll need to enter your current password for verification.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onPasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modal-currentPassword">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="modal-currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  onPasswordFormChange({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="pl-10 pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => onShowCurrentPasswordChange(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-newPassword">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="modal-newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  onPasswordFormChange({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="pl-10 pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => onShowNewPasswordChange(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="modal-confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  onPasswordFormChange({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="pl-10 pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => onShowConfirmPasswordChange(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <AlertDialog
              open={showPasswordConfirm}
              onOpenChange={onShowPasswordConfirmChange}
            >
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00]"
                >
                  Change Password
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirm Password Change
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to change your password? Your
                    current password will be verified before updating.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onPasswordConfirm}>
                    Change Password
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
