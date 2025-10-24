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
  XCircle,
  Settings,
  Award,
  Package,
  MapPin,
} from "lucide-react";
import { Merchant, ModalType } from "@/app/types/Merchant";

interface MerchantTableProps {
  merchants: Merchant[];
  dataLoading: boolean;
  onSetModal: (modal: {
    type: ModalType;
    merchant: Merchant | null;
    newVisibility?: boolean;
    newStatus?: string;
  }) => void;
  onUpdateMerchantStatus: (merchantId: string, status: string) => void;
  onUpdateMerchantVisibility: (merchantId: string, visibility: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  totalCount: number;
}

export default function MerchantTable({
  merchants,
  dataLoading,
  onSetModal,
  onUpdateMerchantStatus,
  onUpdateMerchantVisibility,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  rowsPerPage,
  setRowsPerPage,
  totalCount,
}: MerchantTableProps) {
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, setCurrentPage]);

  // Adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return " !text-green-700";
      case "pending":
        return " !text-yellow-700";
      case "suspended":
        return " !text-red-700";
      default:
        return "";
    }
  };

  const getVisibilityBadgeClass = (visibility: boolean) => {
    return visibility ? "!text-green-700" : "!text-red-700";
  };

  const getFullAddress = (merchant: Merchant) => {
    return [
      merchant.streetAddress,
      merchant.locality,
      merchant.city,
      merchant.state,
      merchant.pincode,
      merchant.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getTruncatedAddress = (address: string, wordLimit: number = 4) => {
    const words = address.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return address;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Merchant Directory</CardTitle>
        <CardDescription>
          Manage all merchant profiles and registrations
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
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
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant ID</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Address</TableHead>
                    <TableHead>Average Ratings</TableHead>
                    {/* <TableHead>Joining Date</TableHead> */}
                    <TableHead>Current Status</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants.map((merchant) => (
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-sm flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                              {getTruncatedAddress(getFullAddress(merchant))}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{getFullAddress(merchant)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      <TableCell>{merchant.averageRating ?? "N/A"}</TableCell>
                      {/* <TableCell>
                        {new Date(merchant.joinedSince).toLocaleDateString()}
                      </TableCell> */}
                      <TableCell>
                        <Select
                          value={merchant.status}
                          onValueChange={(value) => {
                            onSetModal({
                              type: "confirmStatusChange",
                              merchant,
                              newStatus: value,
                            });
                          }}
                        >
                          <SelectTrigger className={`w-28 px-2 py-0.5 text-sm font-semibold border-0 ${getStatusBadgeClass(merchant.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active" >Active</SelectItem>
                            <SelectItem value="suspended" >Suspended</SelectItem>
                            <SelectItem value="pending" >Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={merchant.visibility ? "visible" : "hidden"}
                          onValueChange={(value) => {
                            onSetModal({
                              type: "confirmVisibilityChange",
                              merchant,
                              newVisibility: value === "visible",
                            });
                          }}
                        >
                          <SelectTrigger className={`w-28 px-2 py-0.5 text-sm font-semibold border-0 ${getVisibilityBadgeClass(merchant.visibility)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visible">Visible</SelectItem>
                            <SelectItem value="hidden">Hidden</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
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
                                <Award className="h-4 w-4 text-purple-600" />
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
                                  onSetModal({
                                    type: "managePurchasedPackage",
                                    merchant,
                                  })
                                }
                              >
                                <Package className="h-4 w-4 text-orange-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manage Package</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {merchants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No merchants found matching your criteria.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalCount > 0 && (
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
                      totalCount
                    )}{" "}
                    of {totalCount} entries
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
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
