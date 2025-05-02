import { dashboardService } from "@/services/dashboard";
import { productsService } from "@/services/products";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { DashboardCards } from "./_components/dashboard-cards";
import { DashboardCharts } from "./_components/dashboard-charts";
import { Toolbar } from "./_components/toolbar";
import { loadSearchParams } from "./search-params";

export const metadata: Metadata = {
	title: "Dashboard",
};

type DashboardPageProps = {
	searchParams: Promise<SearchParams>;
};

export default async function DashboardPage({
	searchParams,
}: DashboardPageProps) {
	const { category } = await loadSearchParams(searchParams);

	const [dashboard, categories] = await Promise.all([
		dashboardService.getDashboardData({
			categoryId: category,
		}),
		productsService.getCategories({}),
	]);

	const dashboardCardsData = {
		totalSalesValue: dashboard.total_sales_value,
		totalItemsSold: dashboard.total_items_sold,
		averageSaleValue: dashboard.average_sale_value,
		registeredProducts: dashboard.registered_products,
	};

	return (
		<div className="flex flex-col gap-6">
			<Toolbar categories={categories.categories} />

			<DashboardCards data={dashboardCardsData} />

			{dashboard.total_sales_value > 0 ? (
				<DashboardCharts data={dashboard} />
			) : (
				<div className="flex flex-col items-center justify-center gap-4">
					<h1 className="text-2xl font-bold">No sales data available</h1>
					<p className="text-sm text-muted-foreground">
						Please add some sales data to the system to see the charts.
					</p>
				</div>
			)}
		</div>
	);
}
