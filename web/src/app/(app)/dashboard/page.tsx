import type { Metadata } from "next";
import { DashboardContainer } from "./_components/dashboard-container";

export const metadata: Metadata = {
	title: "Dashboard",
};

export default function DashboardHome() {
	return <DashboardContainer />;
}
