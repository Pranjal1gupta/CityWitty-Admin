import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BookUser,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  Settings,
} from "lucide-react";
import { Merchant, ModalType } from "@/app/types/Merchant";

interface MerchantTableProps {
  merchants: Merchant[];
  dataLoading: boolean;
  onSetModal: (modal: { type: ModalType; merchant: Merchant | null }) => void;
  onUpdateMerchantStatus: (merchantId: string, status: string) => void;
}

export default function MerchantTable({
  merchants,
  dataLoading,
  onSetModal,
  onUpdateMerchantStatus,
}: MerchantTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredMerchants = useMemo(() => {
    return merchants.filter((merchant) => {
      const matchesSearch =
        (merchant.displayName ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (merchant.email ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (merchant.category ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || merchant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [merchants, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredMerchants.length / rowsPerPage);
  const paginatedMerchants = filteredMerchants.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Merchant Directory</CardTitle>
        <CardDescription>
          Manage all merchant profiles and registrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Search by name, email, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dataLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4AA8FF] mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading merchants...</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant ID</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Average Ratings</TableHead>
                    <TableHead>Joining Date</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMerchants.map((merchant) => (
                    <TableRow key={merchant._id} className="hover:bg-gray-50">
                      <TableCell>{merchant.merchantId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {merchant.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {merchant.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{merchant.category}</TableCell>
                      {/* <TableCell> 
                        {[merchant.streetAddress, merchant.locality, merchant.city, merchant.state, merchant.pincode, merchant.country]
                          .filter(Boolean)
                          .join(", ")}
                      </TableCell>*/}
                      <TableCell>
                        {[
                          merchant.streetAddress,
                          merchant.city,
                          // merchant.state,
                          // merchant.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </TableCell>
                      <TableCell>{getStatusBadge(merchant.status)}</TableCell>
                      <TableCell>{merchant.averageRating ?? "N/A"}</TableCell>
                      <TableCell>
                        {new Date(merchant.joinedSince).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {merchant.visibility ? (
                          <Badge className="bg-green-100 text-green-800">
                            Visible
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            Hidden
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {merchant.status === "pending" && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      onSetModal({ type: "approve", merchant })
                                    }
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Approve Merchant</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      onUpdateMerchantStatus(
                                        merchant._id,
                                        "suspended"
                                      )
                                    }
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Reject Merchant</p>
                                </TooltipContent>
                              </Tooltip>
                            </>
                          )}

                          {merchant.status !== "pending" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    onSetModal({
                                      type:
                                        merchant.status === "active"
                                          ? "deactivate"
                                          : "activate",
                                      merchant,
                                    })
                                  }
                                >
                                  {merchant.status === "active" ? (
                                    <ToggleRight className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {merchant.status === "active"
                                    ? "Deactivate"
                                    : "Activate"}{" "}
                                  Merchant
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  onSetModal({
                                    type: "toggleVisibility",
                                    merchant,
                                  })
                                }
                              >
                                {merchant.visibility ? (
                                  <Eye className="h-4 w-4 text-green-600" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Toggle Visibility</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  onSetModal({
                                    type: "toggleStatuses",
                                    merchant,
                                  })
                                }
                              >
                                <CheckCircle className="h-4 w-4 text-purple-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Update Badges</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  onSetModal({
                                    type: "adjustLimits",
                                    merchant,
                                  })
                                }
                              >
                                <Settings className="h-4 w-4 text-blue-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Adjust Limits</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  onSetModal({ type: "view", merchant })
                                }
                              >
                                <BookUser className="h-4 w-4 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Details</p>
                            </TooltipContent>
                          </Tooltip>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredMerchants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No merchants found matching your criteria.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredMerchants.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-center gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Rows per page:</span>
                  <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(value) => {
                      setRowsPerPage(Number(value));
                      setCurrentPage(1); // Reset to first page
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <span className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                    Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * rowsPerPage,
                      filteredMerchants.length
                    )}{" "}
                    of {filteredMerchants.length} entries
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
