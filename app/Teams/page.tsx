"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Eye,
  Trash2,
  Plus,
  Edit,
  DollarSign,
  Target,
} from "lucide-react";
import { toast } from "sonner";

interface IEmployee {
  _id: string;
  empId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  joiningDate?: string;
  department?: string;
  branch?: string;
  role?: string;
  status: "active" | "on_leave" | "suspended" | "terminated";
  defaultMonthlyTarget: number;
  defaultBonusRule: {
    type: "perMerchant" | "fixed";
    amountPerMerchant?: number;
    fixedBonusAmount?: number;
  };
  monthlyRecords: any[];
  totalOnboarded?: number;
  totalBonusEarned?: number;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  suspendedEmployees: number;
  terminatedEmployees: number;
}

type ModalType = "view" | "edit" | "create" | "delete" | null;

export default function TeamsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Filters & data
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveEmployees: 0,
    suspendedEmployees: 0,
    terminatedEmployees: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState<{
    type: ModalType;
    employee: IEmployee | null;
  }>({
    type: null,
    employee: null,
  });

  // Form data for create/edit
  const [formData, setFormData] = useState<{
    empId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    password: string;
    joiningDate: string;
    department: string;
    branch: string;
    role: string;
    status: "active" | "on_leave" | "suspended" | "terminated";
    defaultMonthlyTarget: number;
    defaultBonusRule: {
      type: "perMerchant" | "fixed";
      amountPerMerchant: number;
      fixedBonusAmount: number;
    };
  }>({
    empId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    joiningDate: "",
    department: "",
    branch: "",
    role: "onboarding_agent",
    status: "active",
    defaultMonthlyTarget: 10,
    defaultBonusRule: {
      type: "perMerchant",
      amountPerMerchant: 500,
      fixedBonusAmount: 0,
    },
  });

  // UI loaders
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setDataLoading(true);
      const res = await fetch("/api/employees", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch employees");

      const data = await res.json();
      setEmployees(data.employees || []);
      setStats(data.stats || {
        totalEmployees: 0,
        activeEmployees: 0,
        onLeaveEmployees: 0,
        suspendedEmployees: 0,
        terminatedEmployees: 0,
      });
    } catch (err) {
      console.error(err);
      toast.error("Error loading employees data");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchEmployees();
  }, [user, pathname, fetchEmployees]);

  // Filters
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

  // Modal handlers
  const openCreateModal = () => {
    setFormData({
      empId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      joiningDate: "",
      department: "",
      branch: "",
      role: "onboarding_agent",
      status: "active",
      defaultMonthlyTarget: 10,
      defaultBonusRule: {
        type: "perMerchant",
        amountPerMerchant: 500,
        fixedBonusAmount: 0,
      },
    });
    setModal({ type: "create", employee: null });
  };

  const openEditModal = (employee: IEmployee) => {
    setFormData({
      empId: employee.empId,
      firstName: employee.firstName,
      lastName: employee.lastName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      address: employee.address || "",
      password: employee.password || "",
      joiningDate: employee.joiningDate || "",
      department: employee.department || "",
      branch: employee.branch || "",
      role: employee.role || "onboarding_agent",
      status: employee.status,
      defaultMonthlyTarget: employee.defaultMonthlyTarget,
      defaultBonusRule: {
        type: employee.defaultBonusRule.type,
        amountPerMerchant: employee.defaultBonusRule.amountPerMerchant || 0,
        fixedBonusAmount: employee.defaultBonusRule.fixedBonusAmount || 0,
      },
    });
    setModal({ type: "edit", employee });
  };

  const openViewModal = (employee: IEmployee) => {
    setModal({ type: "view", employee });
  };

  const openDeleteModal = (employee: IEmployee) => {
    setModal({ type: "delete", employee });
  };

  // Form handlers
  const handleSubmit = async () => {
    if (!formData.empId.trim() || !formData.firstName.trim()) {
      toast.error("Employee ID and first name are required");
      return;
    }

    setActionLoadingId(modal.employee?._id || "create");

    try {
      const url = modal.type === "create" ? "/api/employees" : `/api/employees/${modal.employee?._id}`;
      const method = modal.type === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save employee");
      }

      const result = await res.json();
      toast.success(result.message);

      setModal({ type: null, employee: null });
      fetchEmployees();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error saving employee");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!modal.employee) return;

    setActionLoadingId(modal.employee._id);

    try {
      const res = await fetch(`/api/employees/${modal.employee._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete employee");

      toast.success("Employee deleted successfully");
      setModal({ type: null, employee: null });
      fetchEmployees();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error deleting employee");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "on_leave":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "terminated":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatBonusRule = (rule: IEmployee["defaultBonusRule"]) => {
    if (rule.type === "perMerchant") {
      return `₹${rule.amountPerMerchant || 0} per merchant`;
    } else {
      return `₹${rule.fixedBonusAmount || 0} fixed`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Team Management</h1>
            <p className="text-sm text-gray-600">
              Manage team members and their performance metrics
            </p>
          </div>

          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalEmployees.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">All employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Active</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeEmployees.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">On Leave</CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.onLeaveEmployees.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">On leave</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Suspended</CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.suspendedEmployees.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Suspended</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Terminated</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {stats.terminatedEmployees.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Terminated</p>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>Manage team members and their details</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search employees by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
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
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
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
                    {filteredEmployees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          {employees.length === 0
                            ? "No employees found."
                            : "No employees match your search."}
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {employee.empId}
                        </TableCell>
                        <TableCell>
                          {employee.firstName} {employee.lastName || ""}
                        </TableCell>
                        <TableCell>{employee.email || "N/A"}</TableCell>
                        <TableCell className="capitalize">
                          {employee.role?.replace("_", " ") || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(employee.status)}>
                            {employee.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-gray-500" />
                            {employee.defaultMonthlyTarget}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            {formatBonusRule(employee.defaultBonusRule)}
                          </div>
                        </TableCell>
                        <TableCell>{employee.totalOnboarded || 0}</TableCell>
                        <TableCell>₹{employee.totalBonusEarned || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openViewModal(employee)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(employee)}
                              disabled={actionLoadingId === employee._id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog
          open={modal.type === "create" || modal.type === "edit"}
          onOpenChange={(open) => !open && setModal({ type: null, employee: null })}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {modal.type === "create" ? "Add New Employee" : "Edit Employee"}
              </DialogTitle>
              <DialogDescription>
                {modal.type === "create"
                  ? "Enter the details for the new team member."
                  : "Update the employee information."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID *</label>
                <Input
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  placeholder="EMP001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Joining Date</label>
                <Input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Sales"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Branch</label>
                <Input
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
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
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Target</label>
                <Input
                  type="number"
                  value={formData.defaultMonthlyTarget}
                  onChange={(e) => setFormData({ ...formData, defaultMonthlyTarget: parseInt(e.target.value) || 0 })}
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bonus Type</label>
                <Select
                  value={formData.defaultBonusRule.type}
                  onValueChange={(value: any) => setFormData({
                    ...formData,
                    defaultBonusRule: {
                      ...formData.defaultBonusRule,
                      type: value,
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perMerchant">Per Merchant</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.defaultBonusRule.type === "perMerchant" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Amount per Merchant (₹)</label>
                  <Input
                    type="number"
                    value={formData.defaultBonusRule.amountPerMerchant}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultBonusRule: {
                        ...formData.defaultBonusRule,
                        amountPerMerchant: parseInt(e.target.value) || 0,
                      }
                    })}
                    placeholder="500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Fixed Bonus Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.defaultBonusRule.fixedBonusAmount}
                    onChange={(e) => setFormData({
                      ...formData,
                      defaultBonusRule: {
                        ...formData.defaultBonusRule,
                        fixedBonusAmount: parseInt(e.target.value) || 0,
                      }
                    })}
                    placeholder="5000"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModal({ type: null, employee: null })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={actionLoadingId === (modal.employee?._id || "create")}
                className="bg-gradient-to-l from-[#4AA8FF] to-[#FF7A00]"
              >
                {actionLoadingId === (modal.employee?._id || "create") ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog
          open={modal.type === "view"}
          onOpenChange={(open) => !open && setModal({ type: null, employee: null })}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>

            {modal.employee && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Employee ID</label>
                    <p className="text-sm">{modal.employee.empId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm">{modal.employee.firstName} {modal.employee.lastName || ""}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm">{modal.employee.email || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm">{modal.employee.phone || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Address</label>
                    <p className="text-sm">{modal.employee.address || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Password</label>
                    <p className="text-sm">{modal.employee.password ? "••••••••" : "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Joining Date</label>
                    <p className="text-sm">{modal.employee.joiningDate ? new Date(modal.employee.joiningDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Department</label>
                    <p className="text-sm">{modal.employee.department || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Branch</label>
                    <p className="text-sm">{modal.employee.branch || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Role</label>
                    <p className="text-sm capitalize">{modal.employee.role?.replace("_", " ") || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <Badge className={getStatusBadgeClass(modal.employee.status)}>
                      {modal.employee.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Monthly Target</label>
                    <p className="text-sm">{modal.employee.defaultMonthlyTarget}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Bonus Rule</label>
                    <p className="text-sm">{formatBonusRule(modal.employee.defaultBonusRule)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Total Onboarded</label>
                    <p className="text-sm">{modal.employee.totalOnboarded || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Total Bonus Earned</label>
                    <p className="text-sm">₹{modal.employee.totalBonusEarned || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created</label>
                    <p className="text-sm">{new Date(modal.employee.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModal({ type: null, employee: null })}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog
          open={modal.type === "delete"}
          onOpenChange={(open) => !open && setModal({ type: null, employee: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Employee</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {modal.employee?.firstName} {modal.employee?.lastName || ""}?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModal({ type: null, employee: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={actionLoadingId === modal.employee?._id}
              >
                {actionLoadingId === modal.employee?._id ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}