"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Mail, Phone, MapPin, Image, Lock } from "lucide-react";

interface ProfileDetailsCardProps {
  profileForm: {
    username: string;
    email: string;
    phone: string;
    address: string;
    avatar: string;
    permissions: string[];
  };
  profileData: {
    role: "admin" | "superadmin";
  };
}

export default function ProfileDetailsCard({
  profileForm,
  profileData,
}: ProfileDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          Profile Details
        </CardTitle>
        <CardDescription>
          Your personal information and account details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 transition-colors rounded-lg">
          <div className="flex items-center space-x-3 flex-1">
            <User className="text-[#4AA8FF] w-5 h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Username</p>
              <p className="text-sm font-medium text-gray-900 truncate capitalize">{profileForm.username || "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 transition-colors rounded-lg border-t border-gray-100">
          <div className="flex items-center space-x-3 flex-1">
            <Lock className="text-[#FF7A00] w-5 h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-medium text-gray-900 capitalize">{profileData.role || "Not set"}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  profileData.role === 'superadmin' 
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {profileData.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 transition-colors rounded-lg border-t border-gray-100">
          <div className="flex items-center space-x-3 flex-1">
            <Mail className="text-[#4AA8FF] w-5 h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</p>
              <p className="text-sm font-medium text-gray-900 truncate">{profileForm.email || "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 transition-colors rounded-lg border-t border-gray-100">
          <div className="flex items-center space-x-3 flex-1">
            <Phone className="text-[#4AA8FF] w-5 h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</p>
              <p className="text-sm font-medium text-gray-900">{profileForm.phone || "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 transition-colors rounded-lg border-t border-gray-100">
          <div className="flex items-center space-x-3 flex-1">
            <MapPin className="text-[#4AA8FF] w-5 h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
              <p className="text-sm font-medium text-gray-900">{profileForm.address || "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 transition-colors rounded-lg border-t border-gray-100">
          <div className="flex items-center space-x-3 flex-1">
            <Image className="text-[#4AA8FF] w-5 h-5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Avatar</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  profileForm.avatar
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {profileForm.avatar ? "Set" : "Not set"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between py-2 px-4 hover:bg-gray-50 transition-colors rounded-lg border-t border-gray-100">
          <div className="flex items-start space-x-3 flex-1">
            <Lock className="text-[#FF7A00] w-5 h-5 flex-shrink-0 mt-1" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Permissions</p>
              {profileForm.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileForm.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-1">No permissions assigned</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
