import DashboardLayout from "@/components/layout/DashboardLayout";

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
