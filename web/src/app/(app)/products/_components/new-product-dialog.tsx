import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { Products } from "@/services/products/types";
import { Plus } from "lucide-react";
import { NewProductForm } from "./forms/new-product-form";
interface NewProductDialogProps {
	product?: Products;
}

export function NewProductDialog({ product }: NewProductDialogProps) {
	const isEditing = !!product;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					New Product
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Product" : "New Product"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Edit the product information and click save when finished."
							: "Fill in the information of the new product and click save when finished."}
					</DialogDescription>
				</DialogHeader>

				<NewProductForm product={product} />
			</DialogContent>
		</Dialog>
	);
}
