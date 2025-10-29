import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Info,
  Zap,
  Tag,
  Users,
  Store,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import type { Notification } from "@/app/types/Notification";

interface NotificationViewModalProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationViewModal({
  notification,
  isOpen,
  onClose,
}: NotificationViewModalProps) {
  if (!notification) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "update":
        return <Zap className="h-5 w-5 text-yellow-600" />;
      case "promotion":
        return <Tag className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "pending actions":
        return <MessageSquare className="h-5 w-5 text-indigo-600" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTargetIcon = (target: string) => {
    switch (target) {
      case "user":
        return <Users className="h-4 w-4" />;
      case "merchant":
        return <Store className="h-4 w-4" />;
      case "franchise":
        return <Building2 className="h-4 w-4" />;
      case "all":
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case "unsent":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Unsent</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case "user":
        return "Users";
      case "merchant":
        return "Merchants";
      case "franchise":
        return "Franchisees";
      case "all":
        return "All Users";
      default:
        return target;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getTypeIcon(notification.type)}
            <span>{notification.title}</span>
          </DialogTitle>
          <DialogDescription>
            Notification details and delivery information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Status, Type, and Icon */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Type:</span>
                <Badge variant="outline" className="capitalize">
                  {notification.type}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(notification.status)}
              </div>
              {notification.icon && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Icon:</span>
                  <Badge variant="outline" className="capitalize flex items-center gap-1">
                    {getTypeIcon(notification.icon)}
                    {notification.icon}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Message */}
          <div>
            <h4 className="text-sm font-medium mb-2">Message</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>

          {/* Target Audience */}
          <div>
            <h4 className="text-sm font-medium mb-2">Target Audience</h4>
            <div className="flex items-center space-x-2">
              {getTargetIcon(notification.target_audience)}
              <span className="text-sm">{getTargetLabel(notification.target_audience)}</span>
              {notification.target_ids && notification.target_ids.length > 0 && (
                <Badge variant="secondary">
                  {notification.target_ids.length} specific recipient{notification.target_ids.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Target IDs List */}
          {notification.target_ids && notification.target_ids.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Target IDs</h4>
              <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {notification.target_ids.map((id, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Read Status Details */}
          {notification.is_read && Array.isArray(notification.is_read) && notification.is_read.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Read Status Details</h4>
              <div className="bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {notification.is_read.map((status: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{status.target_id}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {status.target_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {status.read ? (
                          <>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Read
                            </Badge>
                            {status.read_at && (
                              <span className="text-xs text-gray-500">
                                {new Date(status.read_at).toLocaleString()}
                              </span>
                            )}
                          </>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Unread
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {notification.is_read.filter((r: any) => r.read).length} Read
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {notification.is_read.filter((r: any) => !r.read).length} Unread
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Additional Fields */}
          {notification.additional_field && Object.keys(notification.additional_field).length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Additional Information</h4>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                {Object.entries(notification.additional_field).map(([key, value], idx) => (
                  <div key={idx} className="flex flex-col gap-1 p-2 bg-white rounded border">
                    <span className="text-xs font-semibold text-gray-600 uppercase">{key}</span>
                    <span className="text-sm text-gray-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {notification.expires_at && (
              <div>
                <h4 className="text-sm font-medium mb-2">Expires At</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(notification.expires_at).toLocaleDateString()}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{new Date(notification.expires_at).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Created At</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Updated At</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(notification.updatedAt).toLocaleDateString()}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{new Date(notification.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
}
