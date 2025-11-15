import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Types } from "mongoose";
import Employee from "@/models/Employee";

// Disable ISR / caching
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Build base query for search
    let baseQuery: any = {};
    if (search) {
      baseQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { empId: { $regex: search, $options: 'i' } },
      ];
    }

    // Build query for pagination (includes status filter)
    let query: any = { ...baseQuery };
    if (status !== 'all') {
      query.status = status;
    }

    const totalCount = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Map employees to response format
    const employeeData = employees.map((employee) => ({
      _id: (employee._id as Types.ObjectId).toString(),
      empId: employee.empId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      password: employee.password,
      joiningDate: employee.joiningDate ? employee.joiningDate.toISOString() : null,
      department: employee.department,
      branch: employee.branch,
      role: employee.role,
      status: employee.status,
      defaultMonthlyTarget: employee.defaultMonthlyTarget,
      defaultBonusRule: employee.defaultBonusRule,
      monthlyRecords: employee.monthlyRecords,
      totalOnboarded: employee.totalOnboarded,
      totalBonusEarned: employee.totalBonusEarned,
      createdAt: employee.createdAt ? employee.createdAt.toISOString() : null,
      updatedAt: employee.updatedAt ? employee.updatedAt.toISOString() : null,
    }));

    // Calculate stats
    const stats = {
      totalEmployees: await Employee.countDocuments({}),
      activeEmployees: await Employee.countDocuments({ status: 'active' }),
      onLeaveEmployees: await Employee.countDocuments({ status: 'on_leave' }),
      suspendedEmployees: await Employee.countDocuments({ status: 'suspended' }),
      terminatedEmployees: await Employee.countDocuments({ status: 'terminated' }),
    };

    return NextResponse.json(
      { employees: employeeData, stats, totalCount },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

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
      defaultMonthlyTarget,
      defaultBonusRule,
    } = body;

    // Basic validation
    if (!empId || !firstName) {
      return NextResponse.json(
        { error: "Employee ID and first name are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["active", "on_leave", "suspended", "terminated"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(", ") },
        { status: 400 }
      );
    }

    // Validate bonus rule
    if (defaultBonusRule) {
      if (!["perMerchant", "fixed"].includes(defaultBonusRule.type)) {
        return NextResponse.json(
          { error: "Invalid bonus rule type. Must be 'perMerchant' or 'fixed'" },
          { status: 400 }
        );
      }
    }

    const newEmployee = new Employee({
      empId: empId.trim(),
      firstName: firstName.trim(),
      lastName: lastName?.trim(),
      email: email?.trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      password: password?.trim(),
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      department: department?.trim(),
      branch: branch?.trim(),
      role: role?.trim() || "onboarding_agent",
      status: status || "active",
      defaultMonthlyTarget: defaultMonthlyTarget || 10,
      defaultBonusRule: defaultBonusRule || { type: "perMerchant", amountPerMerchant: 500 },
    });

    const savedEmployee = await newEmployee.save();

    return NextResponse.json(
      {
        success: true,
        employee: {
          _id: savedEmployee._id.toString(),
          empId: savedEmployee.empId,
          firstName: savedEmployee.firstName,
          lastName: savedEmployee.lastName,
          email: savedEmployee.email,
          phone: savedEmployee.phone,
          address: savedEmployee.address,
          password: savedEmployee.password,
          joiningDate: savedEmployee.joiningDate?.toISOString(),
          department: savedEmployee.department,
          branch: savedEmployee.branch,
          role: savedEmployee.role,
          status: savedEmployee.status,
          defaultMonthlyTarget: savedEmployee.defaultMonthlyTarget,
          defaultBonusRule: savedEmployee.defaultBonusRule,
          createdAt: savedEmployee.createdAt?.toISOString(),
          updatedAt: savedEmployee.updatedAt?.toISOString(),
        },
        message: "Employee created successfully"
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating employee:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "An employee with this ID already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}