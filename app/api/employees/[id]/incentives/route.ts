import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";

export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { incentivePercentages, effectiveFromDate } = body;

    if (!incentivePercentages || typeof incentivePercentages !== "object") {
      return NextResponse.json(
        { error: "Invalid incentivePercentages format" },
        {
          status: 400,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    if (!effectiveFromDate) {
      return NextResponse.json(
        { error: "Effective from date is required" },
        {
          status: 400,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        {
          status: 404,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    const effectiveDate = new Date(effectiveFromDate);

    if (effectiveFromDate !== new Date(effectiveDate).toISOString().split("T")[0]) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        {
          status: 400,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    if (!employee.incentivePercentageHistory) {
      employee.incentivePercentageHistory = [];
    }

    const historyEntry = {
      percentage: { ...incentivePercentages },
      effectiveFrom: effectiveDate,
    };

    employee.incentivePercentageHistory.push(historyEntry);
    employee.incentivePercentages = { ...incentivePercentages };

    await employee.save();

    const employeeObj = employee.toObject();

    return NextResponse.json(
      {
        success: true,
        employee: {
          _id: employeeObj._id.toString(),
          empId: employeeObj.empId,
          firstName: employeeObj.firstName,
          lastName: employeeObj.lastName,
          email: employeeObj.email,
          phone: employeeObj.phone,
          address: employeeObj.address,
          password: employeeObj.password,
          joiningDate: employeeObj.joiningDate?.toISOString(),
          department: employeeObj.department,
          branch: employeeObj.branch,
          role: employeeObj.role,
          status: employeeObj.status,
          defaultMonthlyRevenueTarget: employeeObj.defaultMonthlyRevenueTarget,
          defaultBonusRule: employeeObj.defaultBonusRule,
          packagePrices: employeeObj.packagePrices,
          incentivePercentages: employeeObj.incentivePercentages,
          incentivePercentageHistory: employeeObj.incentivePercentageHistory?.map((entry: any) => ({
            percentage: entry.percentage,
            effectiveFrom: entry.effectiveFrom?.toISOString(),
          })),
          monthlyRecords: employeeObj.monthlyRecords,
          totalOnboarded: employeeObj.totalOnboarded,
          totalBonusEarned: employeeObj.totalBonusEarned,
          onboardingIncentiveEarned: employeeObj.onboardingIncentiveEarned,
          createdAt: employeeObj.createdAt?.toISOString(),
          updatedAt: employeeObj.updatedAt?.toISOString(),
        },
        message: "Incentive percentages updated successfully",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error: any) {
    console.error("Error updating incentive percentages:", error);
    return NextResponse.json(
      { error: "Failed to update incentive percentages" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
}
