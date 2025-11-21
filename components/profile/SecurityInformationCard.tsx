"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock } from "lucide-react";

interface SecurityInformationCardProps {
  failedLoginAttempts: number;
  accountLockedUntil: Date | null;
  accountLockReason: string;
  createdBy: string;
  updatedBy: string;
  meta: Record<string, any>;
}

export default function SecurityInformationCard({
  failedLoginAttempts,
  accountLockedUntil,
  accountLockReason,
  createdBy,
  updatedBy,
  meta,
}: SecurityInformationCardProps) {
  return (
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
          {failedLoginAttempts > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div>
                <p className="text-sm font-medium text-yellow-800">Failed Login Attempts</p>
                <p className="text-sm text-yellow-700">{failedLoginAttempts} attempts</p>
              </div>
              <Lock className="h-5 w-5 text-yellow-600" />
            </div>
          )}

          {accountLockedUntil && (
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md">
              <div>
                <p className="text-sm font-medium text-red-800">Account Locked</p>
                <p className="text-sm text-red-700">
                  Until: {new Date(accountLockedUntil).toLocaleString()}
                </p>
                {accountLockReason && (
                  <p className="text-sm text-red-700">Reason: {accountLockReason}</p>
                )}
              </div>
              <Lock className="h-5 w-5 text-red-600" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Created By</p>
              <p className="text-sm text-gray-600">{createdBy || "System"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Last Updated By</p>
              <p className="text-sm text-gray-600">{updatedBy || "N/A"}</p>
            </div>
          </div>

          {Object.keys(meta).length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Additional Metadata</p>
              <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                {JSON.stringify(meta, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
