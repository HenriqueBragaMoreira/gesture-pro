"use client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

export function Header() {
	const { setTheme } = useTheme();
	const pathname = usePathname();

	const lastSegment = pathname.split("/").pop() || "";

	const path = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);

	return (
		<header className="flex flex-wrap gap-3 min-h-20 shrink-0 items-center transition-all ease-linear border-b">
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

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon">
						<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setTheme("light")}>
						Light
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("dark")}>
						Dark
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("system")}>
						System
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
