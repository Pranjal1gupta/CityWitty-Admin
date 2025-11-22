"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface ProfileOverviewCardProps {
  user: any;
  isProfileLoading: boolean;
  profileForm: {
    avatar: string;
  };
  avatarVersion: number;
  onEditClick: () => void;
  onPasswordClick: () => void;
  profileData: {
    status: "active" | "inactive";
    isSuperAdmin: boolean;
    lastLogin: string;
    lastLoginIP: string;
    uniqueId: string;
  };
}

export default function ProfileOverviewCard({
  user,
  isProfileLoading,
  profileForm,
  avatarVersion,
  onEditClick,
  onPasswordClick,
  profileData,
}: ProfileOverviewCardProps) {
  const [showImagePreview, setShowImagePreview] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 items-center justify-center">
            <CardTitle className="flex items-center text-xl">
              <User className="mr-3 h-6 w-6" />
              Profile Overview
            </CardTitle>
            <div className="hidden lg:flex flex-col lg:flex-row gap-2 lg:gap-3 w-full lg:w-auto">
              <Button
                onClick={onEditClick}
                className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] hover:from-[#4AA8FF]/90 hover:to-[#FF7A00]/90 transition-all duration-200"
                size="sm"
              >
                Edit Profile
              </Button>
              <Button
                onClick={onPasswordClick}
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
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-36 w-36 ring-4 ring-gray-100" key={avatarVersion}>
                  {profileForm.avatar ? (
                    <img
                      src={`${profileForm.avatar}?v=${avatarVersion}`}
                      alt={`${user?.username} avatar`}
                      className="h-full w-full object-cover rounded-full cursor-pointer"
                      onClick={() => setShowImagePreview(true)}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] text-white text-5xl font-bold uppercase">
                      {user?.username
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "A"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="flex-1 min-w-0 space-y-4 sm:text-left text-center">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 sm:justify-start justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                      {user.username}
                    </h3>
                    <p className="text-lg text-gray-600 font-medium">{user.email}</p>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">ID: {profileData.uniqueId}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-start justify-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    profileData.status === 'active' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {profileData.status}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold 
  bg-yellow-100 text-yellow-800 border border-yellow-200">
  {profileData.isSuperAdmin ? "Super Admin" : "Admin"}
</span>

                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-sm text-gray-600 sm:justify-start justify-center">
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
          <div className="flex lg:hidden flex-row gap-2 mt-6 pt-6 border-t border-gray-200 justify-center">
            <Button
              onClick={onEditClick}
              className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] hover:from-[#4AA8FF]/90 hover:to-[#FF7A00]/90 transition-all duration-200"
              size="sm"
            >
              Edit Profile
            </Button>
            <Button
              onClick={onPasswordClick}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 transition-all duration-200"
              size="sm"
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

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
    </>
  );
}
