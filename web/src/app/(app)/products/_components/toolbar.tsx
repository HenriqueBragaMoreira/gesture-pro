import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";

export function Toolbar() {
	return (
		<div className="flex justify-between items-center">
			<div className="flex items-center gap-2">
				<Input placeholder="Search products" />

				<Select>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="Category" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="light">Light</SelectItem>
						<SelectItem value="dark">Dark</SelectItem>
						<SelectItem value="system">System</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center gap-2">
				<Button variant="outline">
					<Upload />
					Import CSV
				</Button>

				<Button>
					<Plus />
					New Product
				</Button>
			</div>
		</div>
	);
}
