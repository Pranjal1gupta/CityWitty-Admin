import { useCallback, useState } from "react";
import { IEmployee, Stats } from "../types/Teams";
import { toast } from "sonner";

export const useEmployeesData = () => {
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEmployees: 0,
    activeEmployees: 0,
    suspendedEmployees: 0,
    terminatedEmployees: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    try {
      setDataLoading(true);
      const res = await fetch("/api/employees", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch employees");

      const data = await res.json();
      setEmployees(data.employees || []);
      setStats(data.stats || {
        totalEmployees: 0,
        activeEmployees: 0,
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

  return { employees, stats, dataLoading, fetchEmployees, setEmployees };
};

export const useEmployeeActions = (fetchEmployees: () => Promise<void>) => {
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const submitEmployee = useCallback(
    async (
      empId: string,
      firstName: string,
      formData: any,
      isCreate: boolean,
      employeeId?: string
    ) => {
      if (!empId.trim() || !firstName.trim()) {
        toast.error("Employee ID and first name are required");
        return false;
      }

      const id = employeeId || "create";
      setActionLoadingId(id);

      try {
        const url = isCreate ? "/api/employees" : `/api/employees/${employeeId}`;
        const method = isCreate ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to save employee");
        }

        const result = await res.json();
        toast.success(result.message);
        await fetchEmployees();
        return true;
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Error saving employee");
        return false;
      } finally {
        setActionLoadingId(null);
      }
    },
    [fetchEmployees]
  );

  const deleteEmployee = useCallback(
    async (employeeId: string) => {
      setActionLoadingId(employeeId);

      try {
        const res = await fetch(`/api/employees/${employeeId}`, {
          method: "DELETE",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        });

        if (!res.ok) throw new Error("Failed to delete employee");

        toast.success("Employee deleted successfully");
        await fetchEmployees();
        return true;
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Error deleting employee");
        return false;
      } finally {
        setActionLoadingId(null);
      }
    },
    [fetchEmployees]
  );

  const updateIncentives = useCallback(
    async (
      employeeId: string,
      incentivePercentages: { [key: string]: number },
      effectiveFromDate: string
    ) => {
      setActionLoadingId(employeeId);

      try {
        const res = await fetch(`/api/employees/${employeeId}/incentives`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
          body: JSON.stringify({
            incentivePercentages,
            effectiveFromDate,
          }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to update incentive percentages");
        }

        toast.success("Incentive percentages updated successfully");
        await fetchEmployees();
        return true;
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Error updating incentive percentages");
        return false;
      } finally {
        setActionLoadingId(null);
      }
    },
    [fetchEmployees]
  );

  const updateStatus = useCallback(
    async (employeeId: string, newStatus: string) => {
      setActionLoadingId(employeeId);

      try {
        const res = await fetch(`/api/employees/${employeeId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to update employee status");
        }

        toast.success("Employee status updated successfully");
        await fetchEmployees();
        return true;
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Error updating employee status");
        return false;
      } finally {
        setActionLoadingId(null);
      }
    },
    [fetchEmployees]
  );

  return {
    actionLoadingId,
    setActionLoadingId,
    submitEmployee,
    deleteEmployee,
    updateIncentives,
    updateStatus,
  };
};
