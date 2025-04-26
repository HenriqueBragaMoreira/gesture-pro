"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function Header() {
	const pathname = usePathname();

	const lastSegment = pathname.split("/").pop() || "";

	const path = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

	return (
		<header className="flex flex-wrap gap-3 min-h-20 py-4 shrink-0 items-center transition-all ease-linear border-b">
			<div className="flex flex-1 items-center gap-2">
				<SidebarTrigger className="-ms-1" />
				<div className="max-lg:hidden lg:contents">
					<Separator
						orientation="vertical"
						className="me-2 data-[orientation=vertical]:h-4"
					/>
					<span className="text-2xl font-semibold">{path}</span>
				</div>
			</div>
		</header>
	);
}
