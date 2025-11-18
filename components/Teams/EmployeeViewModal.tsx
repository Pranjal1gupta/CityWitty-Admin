import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IEmployee } from "../../app/types/Teams";
import { formatBonusRule, getStatusBadgeClass } from "./utils";

interface EmployeeViewModalProps {
  isOpen: boolean;
  employee: IEmployee | null;
  onClose: () => void;
}

export function EmployeeViewModal({
  isOpen,
  employee,
  onClose,
}: EmployeeViewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>

        {employee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Employee ID
                </label>
                <p className="text-sm">{employee.empId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="text-sm">
                  {employee.firstName} {employee.lastName || ""}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-sm">{employee.email || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-sm">{employee.phone || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Address
                </label>
                <p className="text-sm">{employee.address || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Password
                </label>
                <p className="text-sm">
                  {employee.password ? "••••••••" : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Joining Date
                </label>
                <p className="text-sm">
                  {employee.joiningDate
                    ? new Date(employee.joiningDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Department
                </label>
                <p className="text-sm">{employee.department || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Branch
                </label>
                <p className="text-sm">{employee.branch || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Role
                </label>
                <p className="text-sm capitalize">
                  {employee.role?.replace("_", " ") || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Status
                </label>
                <Badge className={getStatusBadgeClass(employee.status)}>
                  {employee.status.replace("_", " ")}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Monthly Revenue Target
                </label>
                <p className="text-sm">₹{employee.defaultMonthlyRevenueTarget}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Bonus Rule
                </label>
                <p className="text-sm">
                  {formatBonusRule(employee.defaultBonusRule)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Total Onboarded
                </label>
                <p className="text-sm">{employee.totalOnboarded || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Total Bonus Earned
                </label>
                <p className="text-sm">₹{employee.totalBonusEarned || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Onboarding Incentive Earned
                </label>
                <p className="text-sm">
                  ₹{employee.onboardingIncentiveEarned || 0}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Created
                </label>
                <p className="text-sm">
                  {new Date(employee.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {employee.incentivePercentages && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold mb-3">
                  Current Incentive Percentages
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(employee.incentivePercentages).map(
                    ([packageName, percentage]) => (
                      <div key={packageName}>
                        <label className="block text-sm font-medium text-gray-500">
                          {packageName}
                        </label>
                        <p className="text-sm">{percentage}%</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
