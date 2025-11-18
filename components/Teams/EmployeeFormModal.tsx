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
import { IEmployee, EmployeeFormData, INITIAL_FORM_DATA } from "../../app/types/Teams";

interface EmployeeFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  isLoading: boolean;
  formData: EmployeeFormData;
  setFormData: (data: EmployeeFormData) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function EmployeeFormModal({
  isOpen,
  isEdit,
  isLoading,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: EmployeeFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the employee information."
              : "Enter the details for the new team member."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Employee ID *
            </label>
            <Input
              value={formData.empId}
              onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
              placeholder="EMP001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              First Name *
            </label>
            <Input
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <Input
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="123 Main St, City, State"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Joining Date</label>
            <Input
              type="date"
              value={formData.joiningDate}
              onChange={(e) =>
                setFormData({ ...formData, joiningDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Input
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              placeholder="Sales"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Branch</label>
            <Input
              value={formData.branch}
              onChange={(e) =>
                setFormData({ ...formData, branch: e.target.value })
              }
              placeholder="Main Branch"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onboarding_agent">Onboarding Agent</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value: any) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Monthly Revenue Target (₹)
            </label>
            <Input
              type="number"
              value={formData.defaultMonthlyRevenueTarget}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  defaultMonthlyRevenueTarget: parseInt(e.target.value) || 0,
                })
              }
              placeholder="10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bonus Type</label>
            <Select
              value={formData.defaultBonusRule.type}
              onValueChange={(value: any) =>
                setFormData({
                  ...formData,
                  defaultBonusRule: {
                    ...formData.defaultBonusRule,
                    type: value,
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perRevenue">Per Revenue</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.defaultBonusRule.type === "perRevenue" ? (
            <div>
              <label className="block text-sm font-medium mb-1">
                Amount per ₹1 Revenue
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.defaultBonusRule.amountPerRevenue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultBonusRule: {
                      ...formData.defaultBonusRule,
                      amountPerRevenue: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                placeholder="0.1"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">
                Fixed Bonus Amount (₹)
              </label>
              <Input
                type="number"
                value={formData.defaultBonusRule.fixedBonusAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultBonusRule: {
                      ...formData.defaultBonusRule,
                      fixedBonusAmount: parseInt(e.target.value) || 0,
                    },
                  })
                }
                placeholder="5000"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
