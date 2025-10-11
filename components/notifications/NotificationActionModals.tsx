// import { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useToast } from "@/hooks/use-toast";
// import { Notification, ModalType } from "@/app/types/Notification";

// interface NotificationActionModalsProps {
//   modal: { type: ModalType; notification: Notification | null };
//   onClose: () => void;
//   onRefresh: () => void;
// }

// export default function NotificationActionModals({
//   modal,
//   onClose,
//   onRefresh,
// }: NotificationActionModalsProps) {
//   const { toast } = useToast();
//   const [formData, setFormData] = useState<{
//     title: string;
//     message: string;
//     type: "info" | "alert" | "update" | "promotion" | "warning";
//     target_audience: "user" | "merchant" | "franchise" | "all";
//     target_ids: string;
//     icon: string;
//     additional_field: string;
//     is_active: boolean;
//     expires_at: string;
//   }>({
//     title: "",
//     message: "",
//     type: "info",
//     target_audience: "all",
//     target_ids: "",
//     icon: "info",
//     additional_field: "",
//     is_active: true,
//     expires_at: "",
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (modal.notification && (modal.type === "edit" || modal.type === "view")) {
//       setFormData({
//         title: modal.notification.title,
//         message: modal.notification.message,
//         type: modal.notification.type,
//         target_audience: modal.notification.target_audience,
//         target_ids: modal.notification.target_ids?.join(', ') || "",
//         icon: modal.notification.icon || "info",
//         additional_field: modal.notification.additional_field ? JSON.stringify(modal.notification.additional_field) : "",
//         is_active: modal.notification.is_active,
//         expires_at: modal.notification.expires_at ? new Date(modal.notification.expires_at).toISOString().split('T')[0] : "",
//       });
//     } else if (modal.type === "create") {
//       setFormData({
//         title: "",
//         message: "",
//         type: "info",
//         target_audience: "all",
//         target_ids: "",
//         icon: "info",
//         additional_field: "",
//         is_active: true,
//         expires_at: "",
//       });
//     }
//   }, [modal]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const url = modal.type === "edit" && modal.notification
//         ? `/api/notifications/${modal.notification._id}`
//         : "/api/notifications";
//       const method = modal.type === "edit" ? "PUT" : "POST";

//       const body = {
//         ...formData,
//         target_ids: formData.target_ids ? formData.target_ids.split(',').map(s => s.trim()).filter(s => s) : undefined,
//         expires_at: formData.expires_at || undefined,
//         additional_field: formData.additional_field ? (() => {
//           try {
//             return JSON.parse(formData.additional_field);
//           } catch {
//             return formData.additional_field;
//           }
//         })() : undefined,
//       };

//       const response = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast({
//           title: "Success",
//           description: data.message,
//         });
//         onRefresh();
//         onClose();
//       } else {
//         toast({
//           title: "Error",
//           description: data.message,
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Something went wrong",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!modal.notification) return;

//     setLoading(true);
//     try {
//       const response = await fetch(`/api/notifications/${modal.notification._id}`, {
//         method: "DELETE",
//       });

//       const data = await response.json();

//       if (data.success) {
//         toast({
//           title: "Success",
//           description: data.message,
//         });
//         onRefresh();
//         onClose();
//       } else {
//         toast({
//           title: "Error",
//           description: data.message,
//           variant: "destructive",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Something went wrong",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const typeOptions = [
//     { value: "info", label: "Info" },
//     { value: "alert", label: "Alert" },
//     { value: "update", label: "Update" },
//     { value: "promotion", label: "Promotion" },
//     { value: "warning", label: "Warning" },
//   ];

//   const audienceOptions = [
//     { value: "user", label: "User" },
//     { value: "merchant", label: "Merchant" },
//     { value: "franchise", label: "Franchise" },
//     { value: "all", label: "All" },
//   ];

//   const iconOptions = typeOptions; // Same as types

//   return (
//     <>
//       {/* Create/Edit Modal */}
//       {(modal.type === "create" || modal.type === "edit") && (
//         <Dialog open={true} onOpenChange={onClose}>
//           <DialogContent className="sm:max-w-[600px]">
//             <DialogHeader>
//               <DialogTitle>
//                 {modal.type === "create" ? "Send New Notification" : "Edit Notification"}
//               </DialogTitle>
//               <DialogDescription>
//                 {modal.type === "create"
//                   ? "Create and send a new notification to users."
//                   : "Update the notification details."}
//               </DialogDescription>
//             </DialogHeader>
//             <form onSubmit={handleSubmit}>
//               <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="title" className="text-right">
//                     Title
//                   </Label>
//                   <Input
//                     id="title"
//                     value={formData.title}
//                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                     className="col-span-3"
//                     required
//                   />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="message" className="text-right">
//                     Message
//                   </Label>
//                   <Textarea
//                     id="message"
//                     value={formData.message}
//                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//                     className="col-span-3"
//                     required
//                   />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="type" className="text-right">
//                     Type
//                   </Label>
//                   <Select
//                     value={formData.type}
//                     onValueChange={(value: any) => setFormData({ ...formData, type: value })}
//                   >
//                     <SelectTrigger className="col-span-3">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {typeOptions.map((option) => (
//                         <SelectItem key={option.value} value={option.value}>
//                           {option.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="target_audience" className="text-right">
//                     Audience
//                   </Label>
//                   <Select
//                     value={formData.target_audience}
//                     onValueChange={(value: any) => setFormData({ ...formData, target_audience: value })}
//                   >
//                     <SelectTrigger className="col-span-3">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {audienceOptions.map((option) => (
//                         <SelectItem key={option.value} value={option.value}>
//                           {option.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="target_ids" className="text-right">
//                     Target IDs
//                   </Label>
//                   <Input
//                     id="target_ids"
//                     value={formData.target_ids}
//                     onChange={(e) => setFormData({ ...formData, target_ids: e.target.value })}
//                     className="col-span-3"
//                     placeholder="Comma separated IDs, leave blank for all in audience"
//                   />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="icon" className="text-right">
//                     Icon
//                   </Label>
//                   <Select
//                     value={formData.icon}
//                     onValueChange={(value) => setFormData({ ...formData, icon: value })}
//                   >
//                     <SelectTrigger className="col-span-3">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {iconOptions.map((option) => (
//                         <SelectItem key={option.value} value={option.value}>
//                           {option.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="additional_field" className="text-right">
//                     Additional Field
//                   </Label>
//                   <Input
//                     id="additional_field"
//                     value={formData.additional_field}
//                     onChange={(e) => setFormData({ ...formData, additional_field: e.target.value })}
//                     className="col-span-3"
//                     placeholder="Optional JSON string"
//                   />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="is_active" className="text-right">
//                     Active
//                   </Label>
//                   <input
//                     id="is_active"
//                     type="checkbox"
//                     checked={formData.is_active}
//                     onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
//                     className="col-span-3"
//                   />
//                 </div>
//                 <div className="grid grid-cols-4 items-center gap-4">
//                   <Label htmlFor="expires_at" className="text-right">
//                     Expires At
//                   </Label>
//                   <Input
//                     id="expires_at"
//                     type="date"
//                     value={formData.expires_at}
//                     onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
//                     className="col-span-3"
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button type="button" variant="outline" onClick={onClose}>
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={loading}>
//                   {loading ? "Saving..." : modal.type === "create" ? "Send Notification" : "Update"}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* View Modal */}
//       {modal.type === "view" && modal.notification && (
//         <Dialog open={true} onOpenChange={onClose}>
//           <DialogContent className="sm:max-w-[600px]">
//             <DialogHeader>
//               <DialogTitle>Notification Details</DialogTitle>
//               <DialogDescription>
//                 View the details of this notification.
//               </DialogDescription>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right font-medium">Title</Label>
//                 <div className="col-span-3">{modal.notification.title}</div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right font-medium">Message</Label>
//                 <div className="col-span-3">{modal.notification.message}</div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right font-medium">Type</Label>
//                 <div className="col-span-3">{modal.notification.type}</div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right font-medium">Target Audience</Label>
//                 <div className="col-span-3">{modal.notification.target_audience}</div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right font-medium">Target IDs</Label>
//                 <div className="col-span-3">{modal.notification.target_ids?.join(', ') || "N/A"}</div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right font-medium">Icon</Label>
//                 <div className="col-span-3">{modal.notification.icon}</div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right font-medium">Additional Field</Label>
//                 <div className="col-span-3">{modal.notification.additional_field ? JSON.stringify(modal.notification.additional_field) : "N/A"}</div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right font-medium">Is Active</Label>
//                 <div className="col-span-3">{modal.notification.is_active ? "Yes" : "No"}</div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right font-medium">Expires At</Label>
//                 <div className="col-span-3">{modal.notification.expires_at ? new Date(modal.notification.expires_at).toLocaleString() : "N/A"}</div>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label className="text-right font-medium">Created At</Label>
//                 <div className="col-span-3">
//                   {new Date(modal.notification.created_at).toLocaleString()}
//                 </div>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button onClick={onClose}>Close</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* Delete Modal */}
//       {modal.type === "delete" && modal.notification && (
//         <AlertDialog open={true} onOpenChange={onClose}>
//           <AlertDialogContent>
//             <AlertDialogHeader>
//               <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//               <AlertDialogDescription>
//                 This action cannot be undone. This will permanently delete the notification.
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel>Cancel</AlertDialogCancel>
//               <AlertDialogAction onClick={handleDelete} disabled={loading}>
//                 {loading ? "Deleting..." : "Delete"}
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       )}
//     </>
//   );
// }
