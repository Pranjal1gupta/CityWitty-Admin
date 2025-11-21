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
  );
}
