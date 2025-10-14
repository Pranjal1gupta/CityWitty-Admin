import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertTriangle, Info, Zap, Tag, EyeOff } from "lucide-react";
import type { NotificationStats } from "@/app/types/Notification";

interface NotificationStatsProps {
  stats: NotificationStats;
}

export default function NotificationStats({ stats }: NotificationStatsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "update":
        return <Zap className="h-4 w-4 text-yellow-600" />;
      case "promotion":
        return <Tag className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "text-blue-600";
      case "alert":
        return "text-red-600";
      case "update":
        return "text-yellow-600";
      case "promotion":
        return "text-green-600";
      case "warning":
        return "text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">All notifications</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
          <EyeOff className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {stats.unread.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Not yet read</p>
        </CardContent>
      </Card>
      {Object.entries(stats.byType).map(([type, count]) => (
        <Card key={type}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium capitalize">
              {type} Notifications
            </CardTitle>
            {getTypeIcon(type)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTypeColor(type)}`}>
              {count.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Type: {type}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
