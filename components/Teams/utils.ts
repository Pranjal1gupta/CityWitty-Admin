import { IEmployee } from "../../app/types/Teams";

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    case "terminated":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatBonusRule = (rule: IEmployee["defaultBonusRule"]): string => {
  if (rule.type === "perRevenue") {
    return `${rule.amountPerRevenue || 0} per ₹1 revenue`;
  } else {
    return `₹${rule.fixedBonusAmount || 0} fixed`;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
      return "text-green-700";
    case "suspended":
      return "text-yellow-700";
    case "terminated":
      return "text-red-700";
    default:
      return "text-gray-700";
  }
};
