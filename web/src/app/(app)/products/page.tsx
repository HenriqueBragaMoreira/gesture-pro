import type { Metadata } from "next";
import { DataTable } from "./_components/data-table";
export const metadata: Metadata = {
	title: "Products",
};

export default function ProductsHome() {
	return <DataTable />;
}
