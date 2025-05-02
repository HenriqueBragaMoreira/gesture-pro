import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryForm } from "./forms/category-form";

type CategoryDialogProps = {
  children: React.JSX.Element;
  id?: string;
  edit?: boolean;
};

export function CategoryDialog({ children, id, edit }: CategoryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{edit ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {edit ? "Edit a category" : "Add a new category to the database."}
        </DialogDescription>

        <CategoryForm id={id} edit={edit} />
      </DialogContent>
    </Dialog>
  );
}
