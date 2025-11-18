  import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const {
      empId,
      firstName,
      lastName,
      email,
      phone,
      address,
      password,
      joiningDate,
      department,
      branch,
      role,
      status,
      defaultMonthlyRevenueTarget,
      defaultBonusRule,
    } = body;

    // Basic validation
    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["active", "on_leave", "suspended", "terminated"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(", ") },
        {
          status: 400,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    // Validate bonus rule
    if (defaultBonusRule) {
      if (!["perRevenue", "fixed"].includes(defaultBonusRule.type)) {
        return NextResponse.json(
          { error: "Invalid bonus rule type. Must be 'perRevenue' or 'fixed'" },
          {
            status: 400,
            headers: { "Cache-Control": "no-store, max-age=0" },
          }
        );
      }
    }

    const updateData: any = {};
    if (empId !== undefined) updateData.empId = empId.trim();
    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName?.trim();
    if (email !== undefined) updateData.email = email?.trim();
    if (phone !== undefined) updateData.phone = phone?.trim();
    if (address !== undefined) updateData.address = address?.trim();
    if (password !== undefined) updateData.password = password?.trim();
    if (joiningDate !== undefined) updateData.joiningDate = joiningDate ? new Date(joiningDate) : undefined;
    if (department !== undefined) updateData.department = department?.trim();
    if (branch !== undefined) updateData.branch = branch?.trim();
    if (role !== undefined) updateData.role = role?.trim();
    if (status !== undefined) updateData.status = status;
    if (defaultMonthlyRevenueTarget !== undefined) updateData.defaultMonthlyRevenueTarget = defaultMonthlyRevenueTarget;
    if (defaultBonusRule !== undefined) updateData.defaultBonusRule = defaultBonusRule;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        {
          status: 404,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    const employee = updatedEmployee.toObject();

    return NextResponse.json(
      {
        success: true,
        employee: {
          _id: employee._id.toString(),
          empId: employee.empId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          address: employee.address,
          password: employee.password,
          joiningDate: employee.joiningDate?.toISOString(),
          department: employee.department,
          branch: employee.branch,
          role: employee.role,
          status: employee.status,
          defaultMonthlyRevenueTarget: employee.defaultMonthlyRevenueTarget,
          defaultBonusRule: employee.defaultBonusRule,
          packagePrices: employee.packagePrices,
          incentivePercentages: employee.incentivePercentages,
          incentivePercentageHistory: employee.incentivePercentageHistory?.map((entry: any) => ({
            percentage: entry.percentage,
            effectiveFrom: entry.effectiveFrom?.toISOString(),
          })),
          monthlyRecords: employee.monthlyRecords,
          totalOnboarded: employee.totalOnboarded,
          totalBonusEarned: employee.totalBonusEarned,
          onboardingIncentiveEarned: employee.onboardingIncentiveEarned,
          createdAt: employee.createdAt?.toISOString(),
          updatedAt: employee.updatedAt?.toISOString(),
        },
        message: "Employee updated successfully"
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error: any) {
    console.error("Error updating employee:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "An employee with this ID already exists" },
        {
          status: 409,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    return NextResponse.json(
      { error: "Failed to update employee" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    const deletedEmployee = await Employee.findByIdAndDelete(id).lean();

    if (!deletedEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        {
          status: 404,
          headers: { "Cache-Control": "no-store, max-age=0" },
        }
      );
    }

    return NextResponse.json(
      { success: true, message: "Employee deleted successfully" },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
}