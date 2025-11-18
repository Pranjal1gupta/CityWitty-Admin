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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IEmployee } from "../../app/types/Teams";

interface IncentivesModalProps {
  isOpen: boolean;
  employee: IEmployee | null;
  currentPercentages: { [key: string]: number };
  effectiveFromDate: string;
  setCurrentPercentages: (percentages: { [key: string]: number }) => void;
  setEffectiveFromDate: (date: string) => void;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function IncentivesModal({
  isOpen,
  employee,
  currentPercentages,
  effectiveFromDate,
  setCurrentPercentages,
  setEffectiveFromDate,
  isLoading,
  onClose,
  onSubmit,
}: IncentivesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Incentive Percentages</DialogTitle>
          <DialogDescription>
            Update incentive percentages for {employee?.firstName}{" "}
            {employee?.lastName || ""} (ID: {employee?.empId})
          </DialogDescription>
        </DialogHeader>

        {employee && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-4">
                Current Incentive Percentages
              </h3>
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                {Object.entries(currentPercentages).map(
                  ([packageName, percentage]) => (
                    <div key={packageName} className="flex items-center gap-4">
                      <label className="block text-sm font-medium min-w-32">
                        {packageName}
                      </label>
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={percentage}
                          onChange={(e) =>
                            setCurrentPercentages({
                              ...currentPercentages,
                              [packageName]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600">%</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Effective From Date
              </label>
              <Input
                type="date"
                value={effectiveFromDate}
                onChange={(e) => setEffectiveFromDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                These percentages will become active from this date and be
                recorded in history
              </p>
            </div>

            {employee.incentivePercentageHistory &&
              employee.incentivePercentageHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">History</h3>
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <Table className="text-xs">
                      <TableHeader className="sticky top-0 bg-gray-100">
                        <TableRow>
                          <TableHead className="text-xs">
                            Effective Date
                          </TableHead>
                          {Object.keys(currentPercentages).map((pkg) => (
                            <TableHead
                              key={pkg}
                              className="text-xs text-right"
                            >
                              {pkg}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employee.incentivePercentageHistory.map(
                          (entry, idx) => (
                            <TableRow key={idx} className="text-xs">
                              <TableCell className="font-medium">
                                {new Date(
                                  entry.effectiveFrom
                                ).toLocaleDateString()}
                              </TableCell>
                              {Object.keys(currentPercentages).map((pkg) => (
                                <TableCell key={pkg} className="text-right">
                                  {entry.percentage[pkg] || 0}%
                                </TableCell>
                              ))}
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
          >
            {isLoading ? "Updating..." : "Update Percentages"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
