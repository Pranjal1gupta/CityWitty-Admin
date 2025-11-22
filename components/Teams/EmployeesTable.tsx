import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Eye,
  Trash2,
  Edit,
  IndianRupee,
  Percent,
} from "lucide-react";
import { IEmployee } from "../../app/types/Teams";
import { formatBonusRule, getStatusColor } from "./utils";

interface EmployeesTableProps {
  employees: IEmployee[];
  dataLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  actionLoadingId: string | null;
  onView: (employee: IEmployee) => void;
  onEdit: (employee: IEmployee) => void;
  onDelete: (employee: IEmployee) => void;
  onStatusChange: (employee: IEmployee, newStatus: string) => void;
  onMonthlyRecords: (employee: IEmployee) => void;
  onIncentives: (employee: IEmployee) => void;
}

export function EmployeesTable({
  employees,
  dataLoading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  actionLoadingId,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onMonthlyRecords,
  onIncentives,
}: EmployeesTableProps) {
  const filteredEmployees = employees.filter((employee) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      employee.firstName.toLowerCase().includes(q) ||
      employee.lastName?.toLowerCase().includes(q) ||
      employee.email?.toLowerCase().includes(q) ||
      employee.empId.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees</CardTitle>
        <CardDescription>Manage team members and their details</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {dataLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4AA8FF] mx-auto" />
            <p className="text-gray-500 mt-2">Loading employees...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border" style={{ minWidth: 0 }}>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name & Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Bonus Rule</TableHead>
                  <TableHead>Onboarded</TableHead>
                  <TableHead>Bonus Earned</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      {employees.length === 0
                        ? "No employees found."
                        : "No employees match your search."}
                    </TableCell>
                  </TableRow>
                )}

                {paginatedEmployees.map((employee) => (
                  <TableRow key={employee._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {employee.empId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {employee.firstName} {employee.lastName || ""}
                        </div>
                        <div className="text-sm text-gray-600">
                          {employee.email || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {employee.role?.replace("_", " ") || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={employee.status}
                        onValueChange={(value) => onStatusChange(employee, value)}
                      >
                        <SelectTrigger
                          className={`w-32 font-semibold text-sm border-0 ${getStatusColor(
                            employee.status
                          )}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        ₹{employee.defaultMonthlyRevenueTarget}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {formatBonusRule(employee.defaultBonusRule)}
                      </div>
                    </TableCell>
                    <TableCell>{employee.totalOnboarded || 0}</TableCell>
                    <TableCell>₹{employee.totalBonusEarned || 0}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onView(employee)}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View employee details</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(employee)}
                            >
                              <Edit className="h-4 w-4 text-amber-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit employee information</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onMonthlyRecords(employee)}
                            >
                              <IndianRupee className="h-4 w-4 text-green-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View monthly records and revenue</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onIncentives(employee)}
                            >
                              <Percent className="h-4 w-4 text-purple-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Manage incentive percentages</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDelete(employee)}
                              disabled={actionLoadingId === employee._id}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete employee record</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredEmployees.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-center gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of{" "}
                {filteredEmployees.length} entries
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
      </CardContent>
    </Card>
  );
}
