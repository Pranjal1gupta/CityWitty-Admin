"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AccountStatisticsCardProps {
  stats: {
    actionsThisMonth: number;
    merchantsApproved: number;
    cardsActivated: number;
    systemUptime: number;
  };
}

export default function AccountStatisticsCard({
  stats,
}: AccountStatisticsCardProps) {
  return (
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
  );
}
