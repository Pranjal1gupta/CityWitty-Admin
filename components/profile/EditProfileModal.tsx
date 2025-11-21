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
import { User, Mail, Phone, MapPin, Image, Upload } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileForm: {
    username: string;
    email: string;
    phone: string;
    address: string;
    avatar: string;
    permissions: string[];
  };
  pendingAvatar: string;
  selectedFile: File | null;
  isUploading: boolean;
  isRemovingAvatar: boolean;
  showProfileConfirm: boolean;
  onShowProfileConfirmChange: (show: boolean) => void;
  onProfileFormChange: (form: any) => void;
  onSelectedFileChange: (file: File | null) => void;
  onPendingAvatarChange: (avatar: string) => void;
  onAvatarUpload: () => Promise<void>;
  onAvatarRemove: () => Promise<void>;
  onProfileUpdate: (e: React.FormEvent) => void;
  onProfileConfirm: () => Promise<void>;
}

export default function EditProfileModal({
  open,
  onOpenChange,
  profileForm,
  pendingAvatar,
  selectedFile,
  isUploading,
  isRemovingAvatar,
  showProfileConfirm,
  onShowProfileConfirmChange,
  onProfileFormChange,
  onSelectedFileChange,
  onPendingAvatarChange,
  onAvatarUpload,
  onAvatarRemove,
  onProfileUpdate,
  onProfileConfirm,
}: EditProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information and settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modal-username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="modal-username"
                  type="text"
                  value={profileForm.username}
                  onChange={(e) =>
                    onProfileFormChange({
                      ...profileForm,
                      username: e.target.value,
                    })
                  }
                  className="pl-10 capitalize"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="modal-email"
                  type="email"
                  value={profileForm.email}
                  disabled={true}
                  onChange={(e) =>
                    onProfileFormChange({
                      ...profileForm,
                      email: e.target.value,
                    })
                  }
                  className="pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="modal-phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    onProfileFormChange({
                      ...profileForm,
                      phone: e.target.value,
                    })
                  }
                  className="pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="modal-address"
                  type="text"
                  value={profileForm.address}
                  onChange={(e) =>
                    onProfileFormChange({
                      ...profileForm,
                      address: e.target.value,
                    })
                  }
                  className="pl-10"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="modal-avatar">Avatar</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => onSelectedFileChange(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={onAvatarUpload}
                    disabled={!selectedFile || isUploading}
                    className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] shrink-0"
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {pendingAvatar || profileForm.avatar ? (
                  <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <img
                      src={pendingAvatar || profileForm.avatar}
                      alt="Avatar preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{pendingAvatar ? "New Avatar (preview)" : "Current Avatar"}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{pendingAvatar || profileForm.avatar}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (pendingAvatar) {
                          onPendingAvatarChange("");
                        } else {
                          onAvatarRemove();
                        }
                      }}
                      disabled={isRemovingAvatar}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isRemovingAvatar ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        "Remove"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="text-center">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">No avatar selected</p>
                      <p className="text-xs text-gray-500">Upload an image or enter a URL above</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* <div className="space-y-2 md:col-span-2">
              <Label htmlFor="modal-permissions">Permissions</Label>
              <Input
                id="modal-permissions"
                type="text"
                value={profileForm.permissions.join(", ")}
                onChange={(e) =>
                  onProfileFormChange({
                    ...profileForm,
                    permissions: e.target.value.split(",").map(p => p.trim()).filter(p => p),
                  })
                }
                placeholder="Enter permissions separated by commas"
              />
              <p className="text-xs text-gray-500">Comma-separated list of permissions</p>
            </div> */}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onPendingAvatarChange("");
              }}
            >
              Cancel
            </Button>
            <AlertDialog
              open={showProfileConfirm}
              onOpenChange={onShowProfileConfirmChange}
            >
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00]"
                >
                  Update Profile
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Confirm Profile Update
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to update your profile
                    information?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onProfileConfirm}>
                    Update
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
