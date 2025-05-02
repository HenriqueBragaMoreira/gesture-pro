import type { Metadata } from "next";
import { DataTable } from "./_components/data-table";

export const metadata: Metadata = {
	title: "Categories",
};

export default function CategoriesPage() {
	return <DataTable />;
}
