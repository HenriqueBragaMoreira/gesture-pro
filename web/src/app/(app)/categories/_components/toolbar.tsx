"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { debounce } from "@/utils/debounce";
import { PlusCircle } from "lucide-react";
import { useCallback } from "react";
import { CategoryDialog } from "./category-dialog";

type ToolbarProps = {
	name: string;
	setName: React.Dispatch<React.SetStateAction<string>>;
};

export function Toolbar({ name, setName }: ToolbarProps) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const debouncedSetName = useCallback(
		debounce((value: unknown) => {
			if (typeof value === "string") {
				setName(value);
			}
		}, 500),
		[setName],
	);

	return (
		<div className="flex justify-between items-center">
			<Input
				placeholder="Search categories"
				defaultValue={name}
				onChange={(e) => debouncedSetName(e.target.value)}
				className="h-9 max-w-60"
			/>

			<CategoryDialog>
				<Button>
					<PlusCircle />
					Add Category
				</Button>
			</CategoryDialog>
		</div>
	);
}
