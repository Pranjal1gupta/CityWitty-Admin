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
import { useState, useEffect } from "react";

interface Admin {
  _id: string;
  uniqueId: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  role: "admin" | "superadmin";
  status: "active" | "inactive";
}

interface EditAdminModalProps {
  admin: Admin | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    username: string;
    email: string;
    phone: string;
    address: string;
  }) => Promise<void>;
}

export function EditAdminModal({
  admin,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
}: EditAdminModalProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username,
        email: admin.email,
        phone: admin.phone || "",
        address: admin.address || "",
      });
      setErrors({});
    }
  }, [admin, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.email && !formData.email.includes("@"))
      newErrors.email = "Invalid email";

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
        phone: "",
        address: "",
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
        phone: "",
        address: "",
      });
      setErrors({});
      onClose();
    }
  };

  if (!admin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Admin Profile</DialogTitle>
          <DialogDescription>
            Update the details for {admin.username}.
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
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
              disabled={isLoading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="123 Main St, City, State"
              disabled={isLoading}
            />
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
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
