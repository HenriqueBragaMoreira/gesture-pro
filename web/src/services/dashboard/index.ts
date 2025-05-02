import { api } from "@/lib/ky";
import { queryParamsBuilder } from "@/utils/query-params-builder";
import type { GetDashboardDataProps, GetDashboardDataResponse } from "./types";

export const dashboardService = {
	getDashboardData: async ({ signal, categoryId }: GetDashboardDataProps) => {
		const { params } = queryParamsBuilder([
			{ param: "category_id", value: categoryId },
		]);

		const response = await api.get(`dashboard?${params}`, {
			signal,
		});

		return response.json<GetDashboardDataResponse>();
	},
	downloadExportedCSV: async () => {
		const response = await api.get("export-csv/sales_with_products");

		return response;
	},
};
