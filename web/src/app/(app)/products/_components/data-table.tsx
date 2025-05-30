"use client";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/use-pagination";
import { productsService } from "@/services/products";
import { useSuspenseQueries } from "@tanstack/react-query";
import {
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { columns } from "./columns";
import { Toolbar } from "./toolbar";

export function DataTable() {
	const [filters, setFilters] = useQueryStates({
		category: parseAsString.withDefault(""),
		name: parseAsString.withDefault(""),
	});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const pagination = usePagination();

	const [products, categories] = useSuspenseQueries({
		queries: [
			{
				queryKey: [
					"products",
					pagination.firstItem,
					pagination.rowsPerPage,
					filters,
				],
				queryFn: async ({ signal }) => {
					return await productsService.getProducts({
						skip: pagination.firstItem,
						limit: pagination.rowsPerPage,
						signal,
						...filters,
					});
				},
			},
			{
				queryKey: ["categories"],
				queryFn: async ({ signal }) => {
					return await productsService.getCategories({ signal });
				},
			},
		],
	});

	const pageCount = Math.ceil(
		(products?.data?.totalProducts ?? 0) / pagination.rowsPerPage,
	);

	const table = useReactTable({
		data: products?.data?.products ?? [],
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnFiltersChange: setColumnFilters,
		pageCount: pageCount,
		manualPagination: true,
		state: {
			columnFilters,
			pagination: {
				pageIndex: pagination.page,
				pageSize: pagination.rowsPerPage,
			},
		},
	});

	const lastItem = Math.min(
		(pagination.page + 1) * pagination.rowsPerPage,
		pageCount * pagination.rowsPerPage,
	);

	return (
		<div className="flex flex-col gap-6">
			<Toolbar
				categories={categories?.data.categories}
				filters={filters}
				setFilters={setFilters}
			/>

			<div className="*:data-[slot=table-container]:max-h-[calc(100vh-20rem)] *:data-[slot=table-container]:rounded-md *:data-[slot=table-container]:border">
				<Table>
					<TableHeader className="sticky w-full top-0 h-10 rounded-t-md bg-accent z-30">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<div className="my-4 flex flex-wrap items-center justify-between px-1">
					<div className="flex items-center gap-4">
						<span className="font-medium text-sm text-muted-foreground">
							Show results:
						</span>

						<Select
							value={pagination.rowsPerPage.toString()}
							onValueChange={(value) => {
								pagination.handleChangeRowsPerPage(Number(value));
							}}
						>
							<SelectTrigger className="max-h-7 rounded-lg border-primary px-3.5 py-0 font-semibold text-primary *:opacity-100 data-[placeholder]:text-primary">
								<SelectValue placeholder={pagination.rowsPerPage} />
							</SelectTrigger>
							<SelectContent className="min-w-(--radix-popper-anchor-width)">
								{[10, 20, 50, 100].map((pageSize) => (
									<SelectItem key={pageSize} value={pageSize.toString()}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex items-center gap-8">
						<span className="font-medium text-sm text-muted-foreground">
							{pagination.firstItem + 1}–
							{lastItem > (products?.data?.totalProducts ?? 0)
								? products?.data?.totalProducts
								: lastItem}{" "}
							de {products?.data?.totalProducts}
						</span>

						<div className="flex gap-1 items-center">
							<Button
								size="icon"
								variant="outline"
								className="size-8"
								disabled={pagination.page === 0}
								onClick={() => pagination.resetPage()}
							>
								<ChevronsLeftIcon />
							</Button>

							<Button
								size="icon"
								variant="outline"
								className="size-8"
								disabled={pagination.page === 0}
								onClick={() =>
									pagination.handleChangePage(null, pagination.page - 1)
								}
							>
								<ChevronLeftIcon />
							</Button>

							<Button
								size="icon"
								variant="outline"
								className="size-8"
								disabled={pagination.page + 1 === pageCount}
								onClick={() =>
									pagination.handleChangePage(null, pagination.page + 1)
								}
							>
								<ChevronRightIcon />
							</Button>

							<Button
								size="icon"
								variant="outline"
								className="size-8"
								disabled={pagination.page + 1 === pageCount}
								onClick={() => pagination.handleChangePage(null, pageCount - 1)}
							>
								<ChevronsRightIcon />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
