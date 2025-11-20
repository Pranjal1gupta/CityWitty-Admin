import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface AdminFormData {
  username: string;
  email: string;
  role: "admin" | "superadmin";
  secretKey: string;
}

interface AdminFormModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (formData: AdminFormData) => Promise<void>;
}

export function AdminFormModal({
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: AdminFormModalProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    username: "",
    email: "",
    role: "admin",
    secretKey: "",
  });

  const [errors, setErrors] = useState<Partial<AdminFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminFormData> = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.email && !formData.email.includes("@"))
      newErrors.email = "Invalid email";
    if (!formData.secretKey.trim()) newErrors.secretKey = "Secret key is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      setFormData({
        username: "",
        email: "",
        role: "admin",
        secretKey: "",
      });
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        username: "",
        email: "",
        role: "admin",
        secretKey: "",
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Admin</DialogTitle>
          <DialogDescription>
            Enter the details for the new admin account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Username *
            </label>
            <Input
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                if (errors.username) setErrors({ ...errors, username: undefined });
              }}
              placeholder="admin_user"
              disabled={isLoading}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-xs text-red-600 mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="admin@example.com"
              disabled={isLoading}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Secret Key *</label>
            <Input
              type="password"
              value={formData.secretKey}
              onChange={(e) => {
                setFormData({ ...formData, secretKey: e.target.value });
                if (errors.secretKey) setErrors({ ...errors, secretKey: undefined });
              }}
              placeholder="Enter secret key"
              disabled={isLoading}
              className={errors.secretKey ? "border-red-500" : ""}
            />
            {errors.secretKey && (
              <p className="text-xs text-red-600 mt-1">{errors.secretKey}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <Select
              value={formData.role}
              onValueChange={(value: any) =>
                setFormData({ ...formData, role: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
          >
            {isLoading ? "Creating..." : "Create Admin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
