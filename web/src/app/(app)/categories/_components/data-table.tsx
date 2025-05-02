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
import { categoriesService } from "@/services/categories";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
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
import { useQueryState } from "nuqs";
import { columns } from "./columns";
import { Toolbar } from "./toolbar";

export function DataTable() {
	const [name, setName] = useQueryState("name", {
		defaultValue: "",
	});
	const pagination = usePagination();

	const { data: categoriesData } = useSuspenseQuery({
		queryKey: [
			"categoriesTable",
			pagination.firstItem,
			pagination.rowsPerPage,
			name,
		],
		queryFn: async ({ signal }) => {
			return await categoriesService.getCategories({
				skip: pagination.firstItem,
				limit: pagination.rowsPerPage,
				signal,
				name,
			});
		},
	});

	const pageCount = Math.ceil(
		(categoriesData?.total ?? 0) / pagination.rowsPerPage,
	);

	const table = useReactTable({
		data: categoriesData?.categories ?? [],
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(), // Keep if needed for client-side filtering later
		pageCount: pageCount,
		manualPagination: true, // Data is paginated on the server
		manualFiltering: true, // Data is filtered on the server
		state: {
			// No columnFilters state needed if filtering is manual
			pagination: {
				pageIndex: pagination.page,
				pageSize: pagination.rowsPerPage,
			},
		},
	});

	const lastItem = Math.min(
		(pagination.page + 1) * pagination.rowsPerPage,
		Math.min(pageCount * pagination.rowsPerPage, categoriesData?.total ?? 0),
	);

	return (
		<div className="flex flex-col gap-6">
			<Toolbar name={name} setName={setName} />

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
							{lastItem > (categoriesData?.total ?? 0)
								? categoriesData?.total
								: lastItem}{" "}
							de {categoriesData?.total}
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
