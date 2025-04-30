import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { masks } from "@/utils/mask";
import {
	Package,
	ShoppingBasket,
	ShoppingCart,
	TrendingUp,
} from "lucide-react";

type DashboardCardsProps = {
	data: {
		total_sales_value: number;
		total_items_sold: number;
		average_sale_value: number;
		registered_products: number;
	};
};

export function DashboardCards({ data }: DashboardCardsProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="gap-2">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Sales</CardTitle>
					<ShoppingCart className="size-5 text-teal-300" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{masks.price(data.total_sales_value.toString())}
					</div>
				</CardContent>
			</Card>

			<Card className="gap-2">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Registered Products
					</CardTitle>
					<Package className="size-5 text-orange-200" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.registered_products}</div>
				</CardContent>
			</Card>

			<Card className="gap-2">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Items Sold</CardTitle>
					<ShoppingBasket className="size-5 text-blue-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{data.total_items_sold}</div>
				</CardContent>
			</Card>

			<Card className="gap-2">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						Average Sale Value
					</CardTitle>
					<TrendingUp className="size-5 text-emerald-500" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{masks.price(data.average_sale_value.toFixed(2))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
