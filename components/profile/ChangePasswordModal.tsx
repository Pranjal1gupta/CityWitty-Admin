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
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

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
  isPasswordVerified: boolean;
  isVerifying: boolean;
  verificationError: string;
  onShowPasswordConfirmChange: (show: boolean) => void;
  onPasswordFormChange: (form: any) => void;
  onShowCurrentPasswordChange: (show: boolean) => void;
  onShowNewPasswordChange: (show: boolean) => void;
  onShowConfirmPasswordChange: (show: boolean) => void;
  onPasswordChange: (e: React.FormEvent) => void;
  onPasswordConfirm: () => Promise<void>;
  onVerifyPassword: () => Promise<void>;
}

export default function ChangePasswordModal({
  open,
  onOpenChange,
  passwordForm,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  showPasswordConfirm,
  isPasswordVerified,
  isVerifying,
  verificationError,
  onShowPasswordConfirmChange,
  onPasswordFormChange,
  onShowCurrentPasswordChange,
  onShowNewPasswordChange,
  onShowConfirmPasswordChange,
  onPasswordChange,
  onPasswordConfirm,
  onVerifyPassword,
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
            <div className="flex gap-2">
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
                disabled={isPasswordVerified}
                className="flex-1"
                placeholder="Enter current password"
              />
              <div className="flex gap-1">
                {!isPasswordVerified && (
                  <button
                    type="button"
                    onClick={onVerifyPassword}
                    disabled={!passwordForm.currentPassword || isVerifying}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors flex items-center justify-center"
                    title="Verify password"
                  >
                    {isVerifying ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </button>
                )}
                {isPasswordVerified && (
                  <button
                    type="button"
                    disabled
                    className="px-3 py-2 bg-green-500 text-white rounded-md flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onShowCurrentPasswordChange(!showCurrentPassword)}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-md transition-colors flex items-center justify-center"
                  title={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {verificationError && (
              <p className="text-red-500 text-sm mt-1">{verificationError}</p>
            )}
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
                disabled={!isPasswordVerified}
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
                disabled={!isPasswordVerified}
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
