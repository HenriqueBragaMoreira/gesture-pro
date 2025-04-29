import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowUpIcon,
  Package,
  ShoppingCart,
} from "lucide-react";

export function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <ShoppingCart className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$ 757,813.31</div>
          <div className="flex gap-1 text-xs text-muted-foreground">
            <span className="flex items-center text-green-500">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              202.1%
            </span>
            <span>compared to last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Registered Products
          </CardTitle>
          <Package className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">15</div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center">0 active products (0%)</span>
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          <ShoppingCart className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">669</div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center">
              Average of 44.6 per product
            </span>
          </p>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          <AlertTriangle className="size-5 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">15</div>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center text-amber-500">
              100% of products
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
