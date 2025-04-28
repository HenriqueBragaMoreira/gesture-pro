import type { Metadata } from "next";
import { DashboardCards } from "./_components/dashboard-cards";
import { DashboardCharts } from "./_components/dashboard-charts";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardHome() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardCards />

      <DashboardCharts />
    </div>
  );
}
