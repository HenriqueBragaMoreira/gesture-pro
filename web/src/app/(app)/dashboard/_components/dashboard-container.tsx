"use client";
import { dashboardService } from "@/services/dashboard";
import { productsService } from "@/services/products";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardCards } from "./dashboard-cards";
import { DashboardCharts } from "./dashboard-charts";
import { Toolbar } from "./toolbar";
export function DashboardContainer() {
	const [category, setCategory] = useState("");

	const { "0": dashboardData, "1": categoriesData } = useSuspenseQueries({
		queries: [
			{
				queryKey: ["dashboard", category],
				queryFn: async ({ signal }) => {
					return await dashboardService.getDashboardData({
						signal,
						category_id: category,
					});
				},
			},
			{
				queryKey: ["products-categories"],
				queryFn: async ({ signal }) => {
					return await productsService.getCategories({ signal });
				},
			},
		],
	});

	const dashboardCardsData = {
		total_sales_value: dashboardData.data.total_sales_value,
		total_items_sold: dashboardData.data.total_items_sold,
		average_sale_value: dashboardData.data.average_sale_value,
		registered_products: dashboardData.data.registered_products,
	};

	return (
		<div className="flex flex-col gap-6">
			<Toolbar
				categories={categoriesData.data}
				category={category}
				setCategory={setCategory}
			/>

			<DashboardCards data={dashboardCardsData} />

			{dashboardData.data.total_sales_value > 0 ? (
				<DashboardCharts data={dashboardData.data} />
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
