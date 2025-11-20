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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Image, Upload } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    permissions: [] as string[],
  });

  const [profileData, setProfileData] = useState({
    uniqueId: "",
    role: "admin" as "admin" | "superadmin",
    status: "active" as "active" | "inactive",
    isSuperAdmin: false,
    lastLogin: "",
    lastLoginIP: "",
    failedLoginAttempts: 0,
    accountLockedUntil: null as Date | null,
    accountLockReason: "",
    createdBy: "",
    updatedBy: "",
    meta: {} as Record<string, any>,
  });

  const [stats, setStats] = useState({
    actionsThisMonth: 0,
    merchantsApproved: 0,
    cardsActivated: 0,
    systemUptime: 0,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showProfileConfirm, setShowProfileConfirm] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }

    const fetchProfile = async () => {
      if (!user) return;
      setIsProfileLoading(true);
      try {
        const res = await fetch(`/api/admin/profile?id=${user.id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          const admin = data.admin;
          setProfileForm({
            username: admin.username || "",
            email: admin.email || "",
            phone: admin.phone || "",
            address: admin.address || "",
            avatar: admin.avatar || "",
            permissions: admin.permissions || [],
          });
          setProfileData({
            uniqueId: admin.uniqueId || "",
            role: admin.role || "admin",
            status: admin.status || "active",
            isSuperAdmin: admin.isSuperAdmin || false,
            lastLogin: admin.lastLogin
              ? new Date(admin.lastLogin).toLocaleString()
              : "",
            lastLoginIP: admin.lastLoginIP || "",
            failedLoginAttempts: admin.failedLoginAttempts || 0,
            accountLockedUntil: admin.accountLockedUntil ? new Date(admin.accountLockedUntil) : null,
            accountLockReason: admin.accountLockReason || "",
            createdBy: admin.createdBy || "",
            updatedBy: admin.updatedBy || "",
            meta: admin.meta || {},
          });
          setStats(admin.stats || {});
          setIsProfileLoading(false);
        } else {
          // fallback to user context data
          setProfileForm((prev) => ({
            ...prev,
            username: user.username || "",
            email: user.email || "",
            phone: "",
            address: "",
            avatar: "",
            permissions: [],
          }));
          setProfileData((prev) => ({
            ...prev,
            role: (user.role === "superadmin" ? "superadmin" : "admin") as "admin" | "superadmin",
          }));
          setIsProfileLoading(false);
        }
      } catch (error) {
        setProfileForm((prev) => ({
          ...prev,
          username: user.username || "",
          email: user.email || "",
          phone: "",
          address: "",
          avatar: "",
          permissions: [],
        }));
        setProfileData((prev) => ({
          ...prev,
          role: (user.role === "superadmin" ? "superadmin" : "admin") as "admin" | "superadmin",
        }));
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, isLoading, router]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.username.trim() || !profileForm.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setShowProfileConfirm(true);
  };

  const handleProfileConfirm = async () => {
    setShowProfileConfirm(false);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          username: profileForm.username,
          email: profileForm.email,
          phone: profileForm.phone,
          address: profileForm.address,
          avatar: profileForm.avatar,
          permissions: profileForm.permissions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Profile updated successfully");
        setShowEditModal(false);
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirm = async () => {
    setShowPasswordConfirm(false);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Password changed successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordModal(false);
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', 'city-witty/avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfileForm({
          ...profileForm,
          avatar: data.url,
        });
        setSelectedFile(null);
        toast.success("Avatar uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload avatar");
      }
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!profileForm.avatar) {
      toast.error("No avatar to remove");
      return;
    }

    setIsRemovingAvatar(true);
    try {
      const res = await fetch('/api/admin/avatar/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarUrl: profileForm.avatar,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfileForm({
          ...profileForm,
          avatar: "",
        });
        toast.success("Avatar removed successfully");
      } else {
        toast.error(data.error || "Failed to remove avatar");
      }
    } catch (error) {
      toast.error("Failed to remove avatar");
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#4AA8FF]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center text-xl">
                <User className="mr-3 h-6 w-6" />
                Profile Overview
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={() => setShowEditModal(true)}
                  className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] hover:from-[#4AA8FF]/90 hover:to-[#FF7A00]/90 transition-all duration-200"
                  size="sm"
                >
                  Edit Profile
                </Button>
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  size="sm"
                >
                  Change Password
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isProfileLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4AA8FF]"></div>
                <span className="ml-2 text-gray-600">Loading profile...</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-28 w-28 ring-4 ring-gray-100">
                  {profileForm.avatar ? (
                    <img
                      src={profileForm.avatar}
                      alt={`${user?.username} avatar`}
                      className="h-full w-full object-cover rounded-full cursor-pointer"
                      onClick={() => setShowImagePreview(true)}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] text-white text-4xl font-bold uppercase">
                      {user?.username
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "A"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="flex-1 min-w-0 space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                      {user.username}
                    </h3>
                    <p className="text-lg text-gray-600 font-medium">{user.email}</p>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">ID: {profileData.uniqueId}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    profileData.status === 'active' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {profileData.status}
                  </span>
                  {profileData.isSuperAdmin && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                      Super Admin
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="font-medium">Last login: {profileData.lastLogin || "Not available"}</span>
                  </div>
                  {profileData.lastLoginIP && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="font-medium">IP: {profileData.lastLoginIP}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Profile Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your personal information and settings.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
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
                        setProfileForm({
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
                        setProfileForm({
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
                        setProfileForm({
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
                        setProfileForm({
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
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleAvatarUpload}
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
                    {profileForm.avatar ? (
                      <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                        <img
                          src={profileForm.avatar}
                          alt="Avatar preview"
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Current Avatar</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{profileForm.avatar}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAvatarRemove}
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

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="modal-permissions">Permissions</Label>
                  <Input
                    id="modal-permissions"
                    type="text"
                    value={profileForm.permissions.join(", ")}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        permissions: e.target.value.split(",").map(p => p.trim()).filter(p => p),
                      })
                    }
                    placeholder="Enter permissions separated by commas"
                  />
                  <p className="text-xs text-gray-500">Comma-separated list of permissions</p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <AlertDialog
                  open={showProfileConfirm}
                  onOpenChange={setShowProfileConfirm}
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
                      <AlertDialogAction onClick={handleProfileConfirm}>
                        Update
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Change Password Modal */}
        <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
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
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="modal-currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="pl-10 pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }
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
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="pl-10 pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
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
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pl-10 pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
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
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </Button>
                <AlertDialog
                  open={showPasswordConfirm}
                  onOpenChange={setShowPasswordConfirm}
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
                      <AlertDialogAction onClick={handlePasswordConfirm}>
                        Change Password
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Image Preview Modal */}
        <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
          <DialogContent className="w-full h-full max-w-none max-h-none bg-black/50 border-none shadow-none p-0">
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute top-4 right-4 z-10 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center justify-center h-full">
              <img
                src={profileForm.avatar}
                alt={`${user?.username} avatar`}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Username</p>
                  <p className="text-sm text-gray-900">{profileForm.username || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Role</p>
                  <p className="text-sm text-gray-900 capitalize">{profileData.role || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Address</p>
                  <p className="text-sm text-gray-900">{profileForm.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone Number</p>
                  <p className="text-sm text-gray-900">{profileForm.phone || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-sm text-gray-900">{profileForm.address || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Image className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Avatar</p>
                  <p className="text-sm text-gray-900">{profileForm.avatar ? "Set" : "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Lock className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Permissions</p>
                  <p className="text-sm text-gray-900">
                    {profileForm.permissions.length > 0 ? profileForm.permissions.join(", ") : "None"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" />
                Permissions
              </CardTitle>
              <CardDescription>Your account permissions and access rights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profileForm.permissions.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Current Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {profileForm.permissions.map((permission, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">No specific permissions assigned</p>
                    <p className="text-xs text-gray-500">Contact administrator for permission updates</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Role-based Access</p>
                      <p className="text-sm text-gray-600">
                        {profileData.role === 'superadmin' ? 'Full system access' :
                         profileData.role === 'admin' ? 'Administrative access' :
                         'Limited access'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profileData.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                      profileData.role === 'admin' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {profileData.role}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Security Information
            </CardTitle>
            <CardDescription>Account security status and login history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profileData.failedLoginAttempts > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Failed Login Attempts</p>
                    <p className="text-sm text-yellow-700">{profileData.failedLoginAttempts} attempts</p>
                  </div>
                  <Lock className="h-5 w-5 text-yellow-600" />
                </div>
              )}

              {profileData.accountLockedUntil && (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-red-800">Account Locked</p>
                    <p className="text-sm text-red-700">
                      Until: {new Date(profileData.accountLockedUntil).toLocaleString()}
                    </p>
                    {profileData.accountLockReason && (
                      <p className="text-sm text-red-700">Reason: {profileData.accountLockReason}</p>
                    )}
                  </div>
                  <Lock className="h-5 w-5 text-red-600" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Created By</p>
                  <p className="text-sm text-gray-600">{profileData.createdBy || "System"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Updated By</p>
                  <p className="text-sm text-gray-600">{profileData.updatedBy || "N/A"}</p>
                </div>
              </div>

              {Object.keys(profileData.meta).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Additional Metadata</p>
                  <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                    {JSON.stringify(profileData.meta, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your admin activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#4AA8FF]">
                  {stats.actionsThisMonth}
                </div>
                <p className="text-sm text-gray-600">Actions This Month</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#FF7A00]">
                  {stats.merchantsApproved}
                </div>
                <p className="text-sm text-gray-600">Merchants Approved</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.cardsActivated}
                </div>
                <p className="text-sm text-gray-600">Cards Activated</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.systemUptime}%
                </div>
                <p className="text-sm text-gray-600">System Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
