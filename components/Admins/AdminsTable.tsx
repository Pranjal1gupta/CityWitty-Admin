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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Trash2, RotateCcw, Crown, Eye, Pencil } from "lucide-react";
import { useState } from "react";

interface Admin {
  _id: string;
  uniqueId: string;
  username: string;
  email: string;
  phone?: string;
  address?: string;
  role: "admin" | "superadmin";
  status: "active" | "inactive";
  avatar?: string;
  isSuperAdmin?: boolean;
  accountLockedUntil?: Date;
  accountLockReason?: string;
  lastLogin?: Date;
  lastLoginIP?: string;
  failedLoginAttempts?: number;
  permissions?: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  meta?: Record<string, any>;
}

interface AdminsTableProps {
  admins: Admin[];
  dataLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (filter: "all" | "active" | "inactive") => void;
  roleFilter: "all" | "admin" | "superadmin";
  setRoleFilter: (filter: "all" | "admin" | "superadmin") => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  totalCount: number;
  onViewDetails: (admin: Admin) => void;
  onEdit: (admin: Admin) => void;
  onResetAttempts: (admin: Admin) => void;
  onSuperAdminToggle: (admin: Admin) => void;
  onDelete: (admin: Admin) => void;
  onStatusChange: (admin: Admin, newStatus: "active" | "inactive") => void;
  isSuperAdmin: boolean;
}

export function AdminsTable({
  admins,
  dataLoading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  roleFilter,
  setRoleFilter,
  currentPage,
  setCurrentPage,
  rowsPerPage,
  setRowsPerPage,
  totalCount,
  onViewDetails,
  onEdit,
  onResetAttempts,
  onSuperAdminToggle,
  onDelete,
  onStatusChange,
  isSuperAdmin,
}: AdminsTableProps) {
  const filteredAdmins = isSuperAdmin ? admins : admins.filter(admin => !admin.isSuperAdmin);
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admins</CardTitle>
        <CardDescription>Manage system administrators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search admins by name, email..."
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
            onValueChange={(value: any) => {
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
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={roleFilter}
            onValueChange={(value: any) => {
              setRoleFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dataLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4AA8FF] mx-auto" />
            <p className="text-gray-500 mt-2">Loading admins...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border" style={{ minWidth: 0 }}>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email & Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Failed Attempts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {filteredAdmins.length === 0 ? "No admins found." : "No admins match your search."}
                    </TableCell>
                  </TableRow>
                )}

                {filteredAdmins.map((admin) => (
                  <TableRow key={admin._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium capitalize flex items-center gap-2">
                      {admin.isSuperAdmin && <Crown className="h-4 w-4 text-yellow-600" />}
                      {admin.username}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{admin.email}</div>
                        <div className="text-sm text-gray-600">{admin.role}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Select
                          value={admin.status}
                          onValueChange={(value) =>
                            onStatusChange(admin, value as "active" | "inactive")
                          }
                        >
                          <SelectTrigger className={`w-24 border-0 ${
                            admin.status === "active"
                              ? "text-green-700 font-semibold"
                              : "text-red-700 font-semibold"
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        {admin.status === "inactive" && admin.accountLockedUntil && (
                          <div className="text-xs text-orange-600 mt-1">
                            Until: {new Date(admin.accountLockedUntil).toLocaleDateString()}
                          </div>
                        )}
                        {admin.status === "inactive" && !admin.accountLockedUntil && (
                          <div className="text-xs text-orange-600 mt-1">
                            Indefinite
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className={`text-sm font-semibold ${
                      (admin.failedLoginAttempts || 0) > 5 
                        ? "text-red-600" 
                        : "text-gray-600"
                    }`}>
                      {admin.failedLoginAttempts || 0}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewDetails(admin)}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
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
                              onClick={() => onEdit(admin)}
                            >
                              <Pencil className="h-4 w-4 text-green-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Profile</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onResetAttempts(admin)}
                              disabled={!admin.failedLoginAttempts || admin.failedLoginAttempts === 0}
                            >
                              <RotateCcw className="h-4 w-4 text-purple-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reset Failed Attempts</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onSuperAdminToggle(admin)
                              }
                              disabled={!isSuperAdmin}
                            >
                              <Crown className={`h-4 w-4 ${admin.isSuperAdmin ? "text-yellow-600" : "text-gray-600"}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {admin.isSuperAdmin ? "Remove Super Admin" : "Make Super Admin"}
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDelete(admin)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete admin</p>
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

        {filteredAdmins.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-center gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => {
                  setRowsPerPage(parseInt(value));
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
                  <SelectItem value="25">25</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <span className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount}{" "}
                entries
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
