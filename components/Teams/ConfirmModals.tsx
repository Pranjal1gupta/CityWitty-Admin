import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IEmployee } from "../../app/types/Teams";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  employee: IEmployee | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  employee,
  isLoading,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Employee</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {employee?.firstName}{" "}
            {employee?.lastName || ""}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface StatusChangeConfirmModalProps {
  isOpen: boolean;
  employee: IEmployee | null;
  newStatus: string | undefined;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function StatusChangeConfirmModal({
  isOpen,
  employee,
  newStatus,
  isLoading,
  onClose,
  onConfirm,
}: StatusChangeConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Status Change</DialogTitle>
          <DialogDescription>
            Are you sure you want to change the status of {employee?.firstName}{" "}
            {employee?.lastName || ""} from{" "}
            <strong>{employee?.status.replace("_", " ")}</strong> to{" "}
            <strong>{newStatus?.replace("_", " ")}</strong>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            No, Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
          >
            {isLoading ? "Updating..." : "Yes, Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
