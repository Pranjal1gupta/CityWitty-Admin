import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IEmployee } from "../../app/types/Teams";

interface MonthlyRecordsModalProps {
  isOpen: boolean;
  employee: IEmployee | null;
  onClose: () => void;
}

export function MonthlyRecordsModal({
  isOpen,
  employee,
  onClose,
}: MonthlyRecordsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Monthly Records & Merchant Details</DialogTitle>
          <DialogDescription>
            Monthly onboarding records and merchant details for{" "}
            {employee?.firstName} {employee?.lastName || ""} (ID:{" "}
            {employee?.empId})
          </DialogDescription>
        </DialogHeader>

        {employee && (
          <div className="space-y-6">
            {employee.monthlyRecords && employee.monthlyRecords.length > 0 ? (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table className="text-sm">
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead>Month/Year</TableHead>
                        <TableHead className="text-right">
                          Revenue Target
                        </TableHead>
                        <TableHead className="text-right">
                          Merchants Onboarded
                        </TableHead>
                        <TableHead className="text-right">Total Revenue</TableHead>
                        <TableHead className="text-right">Bonus Amount</TableHead>
                        <TableHead className="text-center">Calculated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.monthlyRecords
                        .sort((a, b) => {
                          if (a.year !== b.year) return b.year - a.year;
                          return b.month - a.month;
                        })
                        .map((record, idx) => {
                          const totalRevenue = (
                            record.onboardedMerchants || []
                          ).reduce((sum, m) => sum + (m.revenue || 0), 0);
                          return (
                            <TableRow key={idx} className="hover:bg-gray-50">
                              <TableCell className="font-medium">
                                {record.month}/{record.year}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{record.revenueTarget.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {record.onboardedCount}
                              </TableCell>
                              <TableCell className="text-right">
                                ₹{totalRevenue.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                ₹{record.bonusAmount?.toLocaleString() || 0}
                              </TableCell>
                              <TableCell className="text-center">
                                {record.bonusCalculatedAt ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    ✓
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gray-100 text-gray-800">
                                    -
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Merchant Details</h3>
                  {employee.monthlyRecords
                    .sort((a, b) => {
                      if (a.year !== b.year) return b.year - a.year;
                      return b.month - a.month;
                    })
                    .map((record, idx) =>
                      record.onboardedMerchants &&
                      record.onboardedMerchants.length > 0 ? (
                        <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                          <h4 className="text-sm font-semibold mb-3">
                            {record.month}/{record.year} -{" "}
                            {record.onboardedMerchants.length} Merchant(s)
                          </h4>
                          <div className="overflow-x-auto">
                            <Table className="text-xs">
                              <TableHeader className="bg-white">
                                <TableRow>
                                  <TableHead>Merchant ID</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Package</TableHead>
                                  <TableHead className="text-right">
                                    Revenue
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {record.onboardedMerchants.map((merchant) => (
                                  <TableRow
                                    key={merchant.merchantID}
                                    className="hover:bg-gray-100"
                                  >
                                    <TableCell className="font-medium text-xs">
                                      {merchant.merchantID}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {merchant.name}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      {merchant.email}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      <Badge variant="outline">
                                        {merchant.package}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-xs">
                                      ₹{merchant.revenue?.toLocaleString() || 0}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ) : null
                    )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No monthly records found</p>
              </div>
            )}

            {employee.monthlyRecords &&
              employee.monthlyRecords.length > 0 && (
                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Total Onboarded (All Months)
                    </label>
                    <p className="text-lg font-semibold">
                      {employee.totalOnboarded || 0}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Total Bonus Earned (All Months)
                    </label>
                    <p className="text-lg font-semibold">
                      ₹{employee.totalBonusEarned || 0}
                    </p>
                  </div>
                </div>
              )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
