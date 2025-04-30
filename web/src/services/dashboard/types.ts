import type { Products } from "../products/types";

export type GetDashboardDataProps = {
	category_id?: string;
	signal?: AbortSignal;
};

export type GetDashboardDataResponse = {
	registered_products: number;
	total_sales_value: number;
	total_items_sold: number;
	average_sale_value: number;
	sales_by_month: GetDashboardDataResponseSalesByMonthField[];
};

export type GetDashboardDataResponseSalesByMonthField = {
	month: string;
	monthly_total_sales_value: number;
	monthly_total_items_sold: number;
	sales_details: GetDashboardDataResponseSalesDetailsField[];
};

export type GetDashboardDataResponseSalesDetailsField = {
	product_id: number;
	quantity: number;
	id: number;
	total_price: number;
	date: string;
	product: Products;
};
