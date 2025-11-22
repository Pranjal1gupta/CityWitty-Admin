import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Eye,
  Edit,
  Trash2,
  Send,
  Undo2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  Tag,
  Users,
  Clock,
  FileText,
  MessageSquare,
} from "lucide-react";
import type { Notification, ModalType } from "@/app/types/Notification";
import { isNotificationExpired } from "@/lib/notificationUtils";

interface NotificationTableProps {
  notifications: Notification[];
  dataLoading: boolean;
  onSetModal: (modal: {
    type: ModalType;
    notification: Notification | null;
  }) => void;
  onUpdateNotification: (notificationId: string, updates: Partial<Notification>) => void;
  onDeleteNotification: (notificationId: string) => void;
}

export default function NotificationTable({
  notifications,
  dataLoading,
  onSetModal,
  onUpdateNotification,
  onDeleteNotification,
}: NotificationTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "send" | "unsend" | "delete" | null;
    notification: Notification | null;
  }>({
    isOpen: false,
    type: null,
    notification: null,
  });

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const matchesSearch =
        (notification.title ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (notification.message ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesType =
        typeFilter === "all" || notification.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || notification.status === statusFilter;
      const matchesTarget =
        targetFilter === "all" || notification.target_audience === targetFilter;
      return matchesSearch && matchesType && matchesStatus && matchesTarget;
    });
  }, [notifications, searchTerm, typeFilter, statusFilter, targetFilter]);

  const totalPages = Math.ceil(filteredNotifications.length / rowsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter, targetFilter]);

  // Adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case "unsent":
        return <Badge className="bg-orange-100 text-orange-800">Unsent</Badge>;
      case "expired":
        return <Badge className="bg-gray-400 text-white">Expired</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
      case "pending actions":
        return <MessageSquare className="h-4 w-4 text-indigo-600" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTargetBadge = (target: string) => {
    switch (target) {
      case "user":
        return <Badge className="bg-blue-100 text-blue-800">Users</Badge>;
      case "merchant":
        return <Badge className="bg-purple-100 text-purple-800">Merchants</Badge>;
      case "franchise":
        return <Badge className="bg-orange-100 text-orange-800">Franchisees</Badge>;
      case "all":
        return <Badge className="bg-gray-100 text-gray-800">All</Badge>;
      default:
        return <Badge>{target}</Badge>;
    }
  };

  // Confirmation dialog handlers
  const openConfirmDialog = (type: "send" | "unsend" | "delete", notification: Notification) => {
    setConfirmDialog({
      isOpen: true,
      type,
      notification,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: null,
      notification: null,
    });
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.notification) return;

    switch (confirmDialog.type) {
      case "send":
        onUpdateNotification(confirmDialog.notification._id, { status: "sent" });
        break;
      case "unsend":
        onUpdateNotification(confirmDialog.notification._id, { status: "unsent" });
        break;
      case "delete":
        onSetModal({ type: "delete", notification: confirmDialog.notification });
        break;
    }

    closeConfirmDialog();
  };

  const getConfirmDialogContent = () => {
    if (!confirmDialog.notification) return { title: "", description: "", confirmText: "", confirmClass: "" };

    switch (confirmDialog.type) {
      case "send":
        return {
          title: "Send Notification",
          description: `Are you sure you want to send "${confirmDialog.notification.title}"? This will deliver the notification to all target recipients.`,
          confirmText: "Send",
          confirmClass: "bg-green-600 hover:bg-green-700",
        };
      case "unsend":
        return {
          title: "Unsend Notification",
          description: `Are you sure you want to unsend "${confirmDialog.notification.title}"? This will mark the notification as unsent.`,
          confirmText: "Unsend",
          confirmClass: "bg-orange-600 hover:bg-orange-700",
        };
      case "delete":
        return {
          title: "Delete Notification",
          description: `Are you sure you want to delete "${confirmDialog.notification.title}"? This action cannot be undone.`,
          confirmText: "Delete",
          confirmClass: "bg-red-600 hover:bg-red-700",
        };
      default:
        return { title: "", description: "", confirmText: "", confirmClass: "" };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Management</CardTitle>
        <CardDescription>
          Manage all notifications and their delivery status
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Search by title or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="promotion">Promotion</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="pending actions">Pending Actions</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="unsent">Unsent</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={targetFilter} onValueChange={setTargetFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Targets</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="merchant">Merchants</SelectItem>
              <SelectItem value="franchise">Franchisees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dataLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4AA8FF] mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px] px-2 py-1">Title & Message</TableHead>
                    <TableHead className="px-2 py-1">Type</TableHead>
                    <TableHead className="px-2 py-1">Target Audience</TableHead>
                    <TableHead className="px-2 py-1">Status</TableHead>
                    {/* <TableHead>Icon</TableHead> */}
                    <TableHead className="px-2 py-1">Target IDs</TableHead>
                    <TableHead className="px-2 py-1">Read Status</TableHead>
                    <TableHead className="px-2 py-1">Additional Info</TableHead>
                    <TableHead className="px-2 py-1">Expires At</TableHead>
                    {/* <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead> */}
                    <TableHead className="text-center px-2 py-1">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedNotifications.map((notification) => {
                    const readCount = notification.is_read?.filter((r: any) => r.read).length || 0;
                    const totalRecipients = notification.is_read?.length || 0;
                    
                    return (
                      <TableRow key={notification._id} className="hover:bg-gray-50">
                        {/* Title & Message */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900">{notification.title ?notification.title.split(' ').slice(0, 4).join(' ') + '..' :'-'}</div>
                            <div className="text-gray-600">
                              {notification.message 
                                ? notification.message.split(' ').slice(0, 3).join(' ') + '...'
                                : '-'}
                            </div>
                          </div>
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(notification.type)}
                            <span className="capitalize">{notification.type}</span>
                          </div>
                        </TableCell>

                        {/* Target Audience */}
                        <TableCell>{getTargetBadge(notification.target_audience)}</TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(notification.status)}</TableCell>

                        {/* Icon */}
                        {/* <TableCell>
                          <div className="flex items-center gap-2">
                            {notification.icon ? (
                              <>
                                {getTypeIcon(notification.icon)}
                                <span className="text-gray-600 capitalize">{notification.icon}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </TableCell> */}

                        {/* Target IDs */}
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 cursor-pointer">
                                <Users className="h-4 w-4 text-blue-600" />
                                <Badge variant="outline">
                                  {notification.target_ids?.length || 0}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-semibold">Target IDs:</p>
                                {notification.target_ids && notification.target_ids.length > 0 ? (
                                  <ul className="space-y-0.5">
                                    {notification.target_ids.slice(0, 5).map((id, idx) => (
                                      <li key={idx}>• {id}</li>
                                    ))}
                                    {notification.target_ids.length > 5 && (
                                      <li className="text-gray-500">... and {notification.target_ids.length - 5} more</li>
                                    )}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500">No targets</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>

                        {/* Read Status */}
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer">
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">{readCount}</span>
                                </div>
                                <span className="text-gray-400">/</span>
                                <div className="flex items-center gap-1">
                                  <XCircle className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{totalRecipients - readCount}</span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-2">
                                <p className="font-semibold">Read Status Details:</p>
                                {notification.is_read && notification.is_read.length > 0 ? (
                                  <div className="space-y-1">
                                    {notification.is_read.slice(0, 5).map((status: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between gap-2">
                                        <span className="truncate">{status.target_id}</span>
                                        <Badge
                                          variant={status.read ? "default" : "outline"}
                                          className={status.read ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                                        >
                                          {status.read ? "Read" : "Unread"}
                                        </Badge>
                                      </div>
                                    ))}
                                    {notification.is_read.length > 5 && (
                                      <p className="text-gray-500">... and {notification.is_read.length - 5} more</p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-gray-500">No read status data</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>

                        {/* Additional Info */}
                        <TableCell>
                          {notification.additional_field && Object.keys(notification.additional_field).length > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 cursor-pointer">
                                  <FileText className="h-4 w-4 text-purple-600" />
                                  <Badge variant="outline">
                                    {Object.keys(notification.additional_field).length}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <div className="space-y-1">
                                  <p className="font-semibold mb-2">Additional Information:</p>
                                  <div className="space-y-1">
                                    {Object.entries(notification.additional_field).map(([key, value], idx) => (
                                      <div key={idx} className="flex flex-col gap-0.5">
                                        <span className="font-medium text-gray-700">{key}:</span>
                                        <span className="text-gray-600 pl-2">{String(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>

                        {/* Expires At */}
                        <TableCell>
                          {notification.expires_at ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`flex items-center gap-1 cursor-pointer ${isNotificationExpired(notification) ? 'text-gray-400' : 'text-orange-600'}`}>
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {new Date(notification.expires_at).toLocaleDateString()}
                                  </span>
                                  {/* {isNotificationExpired(notification) && (
                                    <Badge className="bg-gray-400 text-white text-xs">Expired</Badge>
                                  )} */}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {isNotificationExpired(notification) ? "Expired: " : "Expires: "}
                                  {new Date(notification.expires_at).toLocaleString()}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>

                        {/* Created At */}
                        {/* <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-pointer">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell> */}

                        {/* Updated At */}
                        {/* <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-pointer">
                                {new Date(notification.updatedAt).toLocaleDateString()}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {new Date(notification.updatedAt).toLocaleString()}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell> */}

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    onSetModal({ type: "view", notification })
                                  }
                                >
                                  <Eye className="h-4 w-4 text-gray-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Details</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isNotificationExpired(notification)}
                                  onClick={() =>
                                    onSetModal({ type: "edit", notification })
                                  }
                                >
                                  <Edit className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isNotificationExpired(notification) ? "Cannot edit expired notification" : "Edit Notification"}</p>
                              </TooltipContent>
                            </Tooltip>

                            {notification.status === "draft" || notification.status === "unsent" ?
                            (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isNotificationExpired(notification)}
                                    onClick={() =>
                                      openConfirmDialog("send", notification)
                                    }
                                  >
                                    <Send className="h-4 w-4 text-green-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{isNotificationExpired(notification) ? "Cannot send expired notification" : "Send Notification"}</p>
                                </TooltipContent>
                              </Tooltip>
                            ):
                            (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={notification.status === "expired"}
                                    onClick={() =>
                                      openConfirmDialog("unsend", notification)
                                    }
                                  >
                                    <Undo2 className="h-4 w-4 text-orange-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{notification.status === "expired" ? "Cannot unsend expired notification" : "Unsend Notification"}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) }


                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    openConfirmDialog("delete", notification)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Notification</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No notifications found matching your criteria.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredNotifications.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-center gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Rows per page:</span>
                  <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(value) => {
                      setRowsPerPage(Number(value));
                      setCurrentPage(1); // Reset to first page
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <span className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * rowsPerPage,
                      filteredNotifications.length
                    )}{" "}
                    of {filteredNotifications.length} entries
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={closeConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getConfirmDialogContent().title}</DialogTitle>
            <DialogDescription>
              {getConfirmDialogContent().description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeConfirmDialog}
            >
              Cancel
            </Button>
            <Button
              className={getConfirmDialogContent().confirmClass}
              onClick={handleConfirmAction}
            >
              {getConfirmDialogContent().confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
