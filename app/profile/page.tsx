"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfileOverviewCard from "@/components/profile/ProfileOverviewCard";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import ProfileDetailsCard from "@/components/profile/ProfileDetailsCard";
import PermissionsCard from "@/components/profile/PermissionsCard";
import SecurityInformationCard from "@/components/profile/SecurityInformationCard";
import AccountStatisticsCard from "@/components/profile/AccountStatisticsCard";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isLoading, updateUser } = useAuth();
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
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [pendingAvatar, setPendingAvatar] = useState<string>("");

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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }

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
      const avatarToSave = pendingAvatar || profileForm.avatar;
      
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user?.id,
          username: profileForm.username,
          email: profileForm.email,
          phone: profileForm.phone,
          address: profileForm.address,
          avatar: avatarToSave,
          permissions: profileForm.permissions,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const fetchRes = await fetch(`/api/admin/profile?id=${user?.id}`);
        const fetchData = await fetchRes.json();
        if (fetchRes.ok && fetchData.success) {
          setProfileForm(prev => ({
            ...prev,
            avatar: fetchData.admin.avatar,
          }));
          updateUser({
            username: fetchData.admin.username,
            email: fetchData.admin.email,
            avatar: fetchData.admin.avatar,
          });
          setPendingAvatar("");
          setAvatarVersion(prev => prev + 1);
        }
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
        setPendingAvatar(data.url);
        setSelectedFile(null);
        toast.success("Avatar uploaded. Click 'Update Profile' to save changes.");
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
        updateUser({ avatar: undefined });
        setAvatarVersion(prev => prev + 1);
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <ProfileOverviewCard
          user={user}
          isProfileLoading={isProfileLoading}
          profileForm={profileForm}
          avatarVersion={avatarVersion}
          onEditClick={() => setShowEditModal(true)}
          onPasswordClick={() => setShowPasswordModal(true)}
          profileData={profileData}
        />

        <EditProfileModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          profileForm={profileForm}
          pendingAvatar={pendingAvatar}
          selectedFile={selectedFile}
          isUploading={isUploading}
          isRemovingAvatar={isRemovingAvatar}
          showProfileConfirm={showProfileConfirm}
          onShowProfileConfirmChange={setShowProfileConfirm}
          onProfileFormChange={setProfileForm}
          onSelectedFileChange={setSelectedFile}
          onPendingAvatarChange={setPendingAvatar}
          onAvatarUpload={handleAvatarUpload}
          onAvatarRemove={handleAvatarRemove}
          onProfileUpdate={handleProfileUpdate}
          onProfileConfirm={handleProfileConfirm}
        />

        <ChangePasswordModal
          open={showPasswordModal}
          onOpenChange={setShowPasswordModal}
          passwordForm={passwordForm}
          showCurrentPassword={showCurrentPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          showPasswordConfirm={showPasswordConfirm}
          onShowPasswordConfirmChange={setShowPasswordConfirm}
          onPasswordFormChange={setPasswordForm}
          onShowCurrentPasswordChange={setShowCurrentPassword}
          onShowNewPasswordChange={setShowNewPassword}
          onShowConfirmPasswordChange={setShowConfirmPassword}
          onPasswordChange={handlePasswordChange}
          onPasswordConfirm={handlePasswordConfirm}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PermissionsCard
            permissions={profileForm.permissions}
            role={profileData.role}
            isSuperAdmin={profileData.isSuperAdmin}
            userId={user?.id || ""}
            currentPermissions={profileForm.permissions}
            onPermissionsUpdated={fetchProfile}
          />
          <ProfileDetailsCard
            profileForm={profileForm}
            profileData={profileData}
          />   
        </div>

        <SecurityInformationCard
          failedLoginAttempts={profileData.failedLoginAttempts}
          accountLockedUntil={profileData.accountLockedUntil}
          accountLockReason={profileData.accountLockReason}
          createdBy={profileData.createdBy}
          updatedBy={profileData.updatedBy}
          meta={profileData.meta}
        />

        <AccountStatisticsCard stats={stats} />
      </div>
    </DashboardLayout>
  );
}
