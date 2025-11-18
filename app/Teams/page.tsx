"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StatsCards } from "@/components/Teams/StatsCards";
import { EmployeesTable } from "@/components/Teams/EmployeesTable";
import { EmployeeFormModal } from "@/components/Teams/EmployeeFormModal";
import { EmployeeViewModal } from "@/components/Teams/EmployeeViewModal";
import { IncentivesModal } from "@/components/Teams/IncentivesModal";
import { MonthlyRecordsModal } from "@/components/Teams/MonthlyRecordsModal";
import {
  DeleteConfirmModal,
  StatusChangeConfirmModal,
} from "@/components/Teams/ConfirmModals";
import {
  IEmployee,
  EmployeeFormData,
  INITIAL_FORM_DATA,
  DEFAULT_INCENTIVE_PERCENTAGES,
  ModalType,
} from "../types/Teams";
import { useEmployeesData, useEmployeeActions } from "./hooks";

export default function TeamsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { employees, stats, dataLoading, fetchEmployees } = useEmployeesData();
  const { actionLoadingId, submitEmployee, deleteEmployee, updateIncentives, updateStatus } =
    useEmployeeActions(fetchEmployees);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [modal, setModal] = useState<{
    type: ModalType;
    employee: IEmployee | null;
    newStatus?: string;
  }>({
    type: null,
    employee: null,
  });

  const [formData, setFormData] = useState<EmployeeFormData>(INITIAL_FORM_DATA);

  const [incentiveData, setIncentiveData] = useState<{
    currentPercentages: { [key: string]: number };
    effectiveFromDate: string;
  }>({
    currentPercentages: DEFAULT_INCENTIVE_PERCENTAGES,
    effectiveFromDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchEmployees();
  }, [user, pathname, fetchEmployees]);

  const openCreateModal = () => {
    setFormData(INITIAL_FORM_DATA);
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
      defaultMonthlyRevenueTarget: employee.defaultMonthlyRevenueTarget,
      defaultBonusRule: {
        type: employee.defaultBonusRule.type,
        amountPerRevenue: employee.defaultBonusRule.amountPerRevenue || 0,
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

  const openIncentivesModal = (employee: IEmployee) => {
    setIncentiveData({
      currentPercentages: employee.incentivePercentages || DEFAULT_INCENTIVE_PERCENTAGES,
      effectiveFromDate: new Date().toISOString().split("T")[0],
    });
    setModal({ type: "incentives", employee });
  };

  const openMonthlyRecordsModal = (employee: IEmployee) => {
    setModal({ type: "monthlyRecords", employee });
  };

  const handleFormSubmit = async () => {
    const result = await submitEmployee(
      formData.empId,
      formData.firstName,
      formData,
      modal.type === "create",
      modal.employee?._id
    );
    if (result) {
      setModal({ type: null, employee: null });
    }
  };

  const handleDeleteEmployee = async () => {
    if (!modal.employee) return;
    const result = await deleteEmployee(modal.employee._id);
    if (result) {
      setModal({ type: null, employee: null });
    }
  };

  const handleStatusChangeConfirm = async () => {
    if (!modal.employee || !modal.newStatus) return;
    const result = await updateStatus(modal.employee._id, modal.newStatus);
    if (result) {
      setModal({ type: null, employee: null });
    }
  };

  const handleIncentiveUpdate = async () => {
    if (!modal.employee) return;
    const result = await updateIncentives(
      modal.employee._id,
      incentiveData.currentPercentages,
      incentiveData.effectiveFromDate
    );
    if (result) {
      setModal({ type: null, employee: null });
    }
  };

  const handleStatusChange = (employee: IEmployee, newStatus: string) => {
    setModal({
      type: "confirmStatusChange",
      employee,
      newStatus,
    });
  };

  return (
    <DashboardLayout>
      <TooltipProvider>
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
          <StatsCards stats={stats} />

          {/* Employees Table */}
          <EmployeesTable
            employees={employees}
            dataLoading={dataLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            actionLoadingId={actionLoadingId}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onStatusChange={handleStatusChange}
            onMonthlyRecords={openMonthlyRecordsModal}
            onIncentives={openIncentivesModal}
          />

          {/* Modals */}
          <EmployeeFormModal
            isOpen={modal.type === "create" || modal.type === "edit"}
            isEdit={modal.type === "edit"}
            isLoading={actionLoadingId === (modal.employee?._id || "create")}
            formData={formData}
            setFormData={setFormData}
            onClose={() => setModal({ type: null, employee: null })}
            onSubmit={handleFormSubmit}
          />

          <EmployeeViewModal
            isOpen={modal.type === "view"}
            employee={modal.employee}
            onClose={() => setModal({ type: null, employee: null })}
          />

          <DeleteConfirmModal
            isOpen={modal.type === "delete"}
            employee={modal.employee}
            isLoading={actionLoadingId === modal.employee?._id}
            onClose={() => setModal({ type: null, employee: null })}
            onConfirm={handleDeleteEmployee}
          />

          <IncentivesModal
            isOpen={modal.type === "incentives"}
            employee={modal.employee}
            currentPercentages={incentiveData.currentPercentages}
            effectiveFromDate={incentiveData.effectiveFromDate}
            setCurrentPercentages={(percentages) =>
              setIncentiveData({
                ...incentiveData,
                currentPercentages: percentages,
              })
            }
            setEffectiveFromDate={(date) =>
              setIncentiveData({
                ...incentiveData,
                effectiveFromDate: date,
              })
            }
            isLoading={actionLoadingId === modal.employee?._id}
            onClose={() => setModal({ type: null, employee: null })}
            onSubmit={handleIncentiveUpdate}
          />

          <MonthlyRecordsModal
            isOpen={modal.type === "monthlyRecords"}
            employee={modal.employee}
            onClose={() => setModal({ type: null, employee: null })}
          />

          <StatusChangeConfirmModal
            isOpen={modal.type === "confirmStatusChange"}
            employee={modal.employee}
            newStatus={modal.newStatus}
            isLoading={actionLoadingId === modal.employee?._id}
            onClose={() => setModal({ type: null, employee: null })}
            onConfirm={handleStatusChangeConfirm}
          />
      </div>
      </TooltipProvider>
    </DashboardLayout>
  );
}