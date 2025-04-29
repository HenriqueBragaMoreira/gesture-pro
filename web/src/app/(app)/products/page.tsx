import type { Metadata } from "next";
import { Suspense } from "react";
import { DataTable } from "./_components/data-table";
import { DataTableSkeleton } from "./_components/data-table-skeleton";
export const metadata: Metadata = {
	title: "Products",
};

export default function ProductsHome() {
	return (
		<Suspense fallback={<DataTableSkeleton />}>
			<DataTable />
		</Suspense>
	);
}
