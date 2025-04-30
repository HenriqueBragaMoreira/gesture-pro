import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardContainer } from "./_components/dashboard-container";
import { DashboardSkeleton } from "./_components/dashboard-skeleton";

export const metadata: Metadata = {
	title: "Dashboard",
};

export default function DashboardHome() {
	return (
		<Suspense fallback={<DashboardSkeleton />}>
			<DashboardContainer />
		</Suspense>
	);
}
