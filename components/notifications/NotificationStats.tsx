import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Info, AlertTriangle, RefreshCw, Megaphone, AlertCircle } from "lucide-react";
import type { NotificationStats } from "@/app/types/Notification";

interface NotificationStatsProps {
  stats: NotificationStats;
}

export default function NotificationStats({ stats }: NotificationStatsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'update':
        return <RefreshCw className="h-4 w-4 text-green-600" />;
      case 'promotion':
        return <Megaphone className="h-4 w-4 text-purple-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">All sent</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Info</CardTitle>
          {getIcon('info')}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.byType.info.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Informational</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alerts</CardTitle>
          {getIcon('alert')}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.byType.alert.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Critical alerts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Updates</CardTitle>
          {getIcon('update')}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.byType.update.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">System updates</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Promotions</CardTitle>
          {getIcon('promotion')}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {stats.byType.promotion.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Marketing</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          {getIcon('warning')}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.byType.warning.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Warnings</p>
        </CardContent>
      </Card>
    </div>
  );
}
