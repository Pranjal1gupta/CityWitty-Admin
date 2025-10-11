// import { useState, useMemo, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   Eye,
//   Edit,
//   Trash2,
//   Info,
//   AlertTriangle,
//   RefreshCw,
//   Megaphone,
//   AlertCircle,
// } from "lucide-react";
// import { Notification, ModalType } from "@/app/types/Notification";

// interface NotificationTableProps {
//   notifications: Notification[];
//   dataLoading: boolean;
//   onSetModal: (modal: { type: ModalType; notification: Notification | null }) => void;
// }

// export default function NotificationTable({
//   notifications,
//   dataLoading,
//   onSetModal,
// }: NotificationTableProps) {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [audienceFilter, setAudienceFilter] = useState("all");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   const filteredNotifications = useMemo(() => {
//     return notifications.filter((notification) => {
//       const matchesSearch =
//         (notification.title ?? "")
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase()) ||
//         (notification.message ?? "")
//           .toLowerCase()
//           .includes(searchTerm.toLowerCase());
//       const matchesType = typeFilter === "all" || notification.type === typeFilter;
//       const matchesAudience = audienceFilter === "all" || notification.target_audience === audienceFilter;
//       const matchesActive = activeFilter === "all" || (activeFilter === "active" ? notification.is_active : !notification.is_active);
//       return matchesSearch && matchesType && matchesAudience && matchesActive;
//     });
//   }, [notifications, searchTerm, typeFilter, audienceFilter, activeFilter]);

//   const totalPages = Math.ceil(filteredNotifications.length / rowsPerPage);
//   const paginatedNotifications = filteredNotifications.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   // Reset to first page when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, typeFilter, audienceFilter, activeFilter]);

//   // Adjust current page if it exceeds total pages
//   useEffect(() => {
//     if (currentPage > totalPages && totalPages > 0) {
//       setCurrentPage(totalPages);
//     }
//   }, [currentPage, totalPages]);

//   const getTypeBadge = (type: string) => {
//     const iconMap = {
//       info: <Info className="h-3 w-3" />,
//       alert: <AlertTriangle className="h-3 w-3" />,
//       update: <RefreshCw className="h-3 w-3" />,
//       promotion: <Megaphone className="h-3 w-3" />,
//       warning: <AlertCircle className="h-3 w-3" />,
//     };
//     const colorMap = {
//       info: "bg-blue-100 text-blue-800",
//       alert: "bg-red-100 text-red-800",
//       update: "bg-green-100 text-green-800",
//       promotion: "bg-purple-100 text-purple-800",
//       warning: "bg-yellow-100 text-yellow-800",
//     };
//     return (
//       <Badge className={`${colorMap[type as keyof typeof colorMap]} flex items-center gap-1`}>
//         {iconMap[type as keyof typeof iconMap]}
//         {type.charAt(0).toUpperCase() + type.slice(1)}
//       </Badge>
//     );
//   };

//   const getActiveBadge = (isActive: boolean) => {
//     if (isActive) {
//       return <Badge className="bg-green-100 text-green-800">Active</Badge>;
//     }
//     return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
//   };

//   const getAudienceBadge = (targetAudience: string) => {
//     const colorMap = {
//       user: "bg-blue-100 text-blue-800",
//       merchant: "bg-green-100 text-green-800",
//       franchise: "bg-purple-100 text-purple-800",
//       all: "bg-gray-100 text-gray-800",
//     };
//     return (
//       <Badge className={colorMap[targetAudience as keyof typeof colorMap]}>
//         {targetAudience.charAt(0).toUpperCase() + targetAudience.slice(1)}
//       </Badge>
//     );
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Notification Directory</CardTitle>
//         <CardDescription>
//           Manage all sent notifications
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="flex flex-col sm:flex-row gap-4 mb-6">
//           <div className="relative flex-1">
//             <Input
//               placeholder="Search by title or message..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           <Select value={typeFilter} onValueChange={setTypeFilter}>
//             <SelectTrigger className="w-32">
//               <SelectValue placeholder="Type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Types</SelectItem>
//               <SelectItem value="info">Info</SelectItem>
//               <SelectItem value="alert">Alert</SelectItem>
//               <SelectItem value="update">Update</SelectItem>
//               <SelectItem value="promotion">Promotion</SelectItem>
//               <SelectItem value="warning">Warning</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={audienceFilter} onValueChange={setAudienceFilter}>
//             <SelectTrigger className="w-32">
//               <SelectValue placeholder="Audience" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Audiences</SelectItem>
//               <SelectItem value="user">User</SelectItem>
//               <SelectItem value="merchant">Merchant</SelectItem>
//               <SelectItem value="franchise">Franchise</SelectItem>
//               <SelectItem value="all">All</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={activeFilter} onValueChange={setActiveFilter}>
//             <SelectTrigger className="w-32">
//               <SelectValue placeholder="Active" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All</SelectItem>
//               <SelectItem value="active">Active</SelectItem>
//               <SelectItem value="inactive">Inactive</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {dataLoading ? (
//           <div className="text-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4AA8FF] mx-auto"></div>
//             <p className="text-gray-500 mt-2">Loading notifications...</p>
//           </div>
//         ) : (
//           <>
//             <div className="rounded-md border">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>ID</TableHead>
//                     <TableHead>Title</TableHead>
//                     <TableHead>Type</TableHead>
//                     <TableHead>Audience</TableHead>
//                     <TableHead>Targets</TableHead>
//                     <TableHead>Date Sent</TableHead>
//                     <TableHead>Active</TableHead>
//                     <TableHead className="text-center">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {paginatedNotifications.map((notification) => (
//                     <TableRow key={notification._id} className="hover:bg-gray-50">
//                       <TableCell>{notification._id.slice(-8)}</TableCell>
//                       <TableCell>
//                         <div className="font-medium">{notification.title}</div>
//                         <div className="text-sm text-gray-500 truncate max-w-xs">
//                           {notification.message}
//                         </div>
//                       </TableCell>
//                       <TableCell>{getTypeBadge(notification.type)}</TableCell>
//                       <TableCell>{getAudienceBadge(notification.target_audience)}</TableCell>
//                       <TableCell>{notification.target_ids ? `${notification.target_ids.length} targets` : "All"}</TableCell>
//                       <TableCell>
//                         {new Date(notification.created_at).toLocaleDateString()}
//                       </TableCell>
//                       <TableCell>{getActiveBadge(notification.is_active)}</TableCell>
//                       <TableCell>
//                         <div className="flex items-center space-x-2">
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() =>
//                                   onSetModal({ type: "view", notification })
//                                 }
//                               >
//                                 <Eye className="h-4 w-4 text-gray-500" />
//                               </Button>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                               <p>View Details</p>
//                             </TooltipContent>
//                           </Tooltip>
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() =>
//                                   onSetModal({ type: "edit", notification })
//                                 }
//                               >
//                                 <Edit className="h-4 w-4 text-blue-500" />
//                               </Button>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                               <p>Edit Notification</p>
//                             </TooltipContent>
//                           </Tooltip>
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() =>
//                                   onSetModal({ type: "delete", notification })
//                                 }
//                                 className="text-red-600 hover:text-red-700"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                               <p>Delete Notification</p>
//                             </TooltipContent>
//                           </Tooltip>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>

//             {filteredNotifications.length === 0 && (
//               <div className="text-center py-8">
//                 <p className="text-gray-500">
//                   No notifications found matching your criteria.
//                 </p>
//               </div>
//             )}

//             {/* Pagination Controls */}
//             {filteredNotifications.length > 0 && (
//               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-center gap-4 mt-4">
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm text-gray-700">Rows per page:</span>
//                   <Select
//                     value={rowsPerPage.toString()}
//                     onValueChange={(value) => {
//                       setRowsPerPage(Number(value));
//                       setCurrentPage(1); // Reset to first page
//                     }}
//                   >
//                     <SelectTrigger className="w-20">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="5">5</SelectItem>
//                       <SelectItem value="10">10</SelectItem>
//                       <SelectItem value="15">15</SelectItem>
//                       <SelectItem value="20">20</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
//                   <span className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
//                     Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
//                     {Math.min(
//                       currentPage * rowsPerPage,
//                       filteredNotifications.length
//                     )}{" "}
//                     of {filteredNotifications.length} entries
//                   </span>
//                   <div className="flex items-center space-x-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() =>
//                         setCurrentPage((prev) => Math.max(prev - 1, 1))
//                       }
//                       disabled={currentPage === 1}
//                     >
//                       Previous
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() =>
//                         setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                       }
//                       disabled={currentPage === totalPages}
//                     >
//                       Next
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
