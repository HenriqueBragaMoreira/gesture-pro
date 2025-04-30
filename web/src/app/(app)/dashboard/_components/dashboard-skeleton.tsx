import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex justify-between items-center">
				<Skeleton className="w-72 h-9" />

				<Skeleton className="w-24 h-9" />
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Skeleton className="w-full h-28" />

				<Skeleton className="w-full h-28" />

				<Skeleton className="w-full h-28" />

				<Skeleton className="w-full h-28" />
			</div>

			<div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
				<Skeleton className="w-full h-[582px]" />

				<Skeleton className="w-full h-[582px]" />

				<Skeleton className="col-span-2 w-full h-[965px]" />
			</div>
		</div>
	);
}
