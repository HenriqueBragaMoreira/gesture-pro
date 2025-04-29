import { Skeleton } from "@/components/ui/skeleton";

export function DataTableSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Skeleton className="h-9 w-60" />
					<Skeleton className="h-10 w-32" />
				</div>

				<div className="flex items-center gap-2">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-32" />
				</div>
			</div>
			<div>
				<Skeleton className="h-[677px] w-full rounded-md" />

				<div className="my-4 flex flex-wrap items-center justify-between px-1">
					<div className="flex items-center gap-4">
						<Skeleton className="h-6 w-24" />

						<Skeleton className="h-7 w-9 rounded-lg" />
					</div>
					<div className="flex items-center gap-8">
						<Skeleton className="h-6 w-20" />

						<div className="flex gap-0.5 items-center">
							<Skeleton className="size-9" />

							<Skeleton className="size-9" />

							<Skeleton className="size-9" />

							<Skeleton className="size-9" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
