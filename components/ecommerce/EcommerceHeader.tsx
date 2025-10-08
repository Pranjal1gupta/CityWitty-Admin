import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface EcommerceHeaderProps {
  lowStockCount: number;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  onAddClick?: () => void;
  hasFormData?: () => boolean;
  onCloseAttempt?: () => void;
  children?: React.ReactNode;
}

export const EcommerceHeader: React.FC<EcommerceHeaderProps> = ({
  lowStockCount,
  isAddDialogOpen,
  setIsAddDialogOpen,
  onAddClick,
  onCloseAttempt,
  children,
}) => {
  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    }
    setIsAddDialogOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (onCloseAttempt) {
        onCloseAttempt();
      } else {
        setIsAddDialogOpen(open);
      }
    } else {
      setIsAddDialogOpen(open);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ecommerce Store Control</h1>
        <p className="text-gray-600">Manage products, orders, and store operations</p>
      </div>
      <div className="flex space-x-2">
        <Badge className="bg-[#FF7A00] text-white animate-pulse">
          {lowStockCount} Low Stock Items
        </Badge>
        <Dialog open={isAddDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00]"
              onClick={handleAddClick}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          {children}
        </Dialog>
      </div>
    </div>
  );
};
