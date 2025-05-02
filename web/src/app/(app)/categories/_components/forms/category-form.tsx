import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogFooter,
  handleCloseDialog,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { categoriesService } from "@/services/categories";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
});

type CategorySchemaType = z.infer<typeof categorySchema>;

type CategoryFormProps = {
  id?: string;
  edit?: boolean;
};

export function CategoryForm({ id, edit }: CategoryFormProps) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["addCategory"],
    mutationFn: async (value: CategorySchemaType) => {
      return await categoriesService.addCategory(value);
    },

    onError() {
      toast.error("Error creating category");
    },

    onSuccess: () => {
      toast.success("Category created successfully");

      handleCloseDialog();

      queryClient.invalidateQueries({ queryKey: ["categoriesTable"] });
    },
  });

  const { mutate: updateCategory, isPending: isUpdating } = useMutation({
    mutationKey: ["updateCategory"],
    mutationFn: async (value: z.infer<typeof categorySchema>) => {
      await categoriesService.updateCategory({
        id: id ?? "",
        name: value.name,
      });
    },

    onError() {
      toast.error("Error updating category");
    },

    onSuccess: () => {
      toast.success("Category updated successfully");

      handleCloseDialog();

      queryClient.invalidateQueries({ queryKey: ["categoriesTable"] });
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((value) => {
          if (edit) {
            updateCategory(value);
          } else {
            mutate(value);
          }
        })}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Type the category name" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button
              disabled={isPending || isUpdating}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={isPending || isUpdating} type="submit">
            {edit ? "Update Category" : "Add Category"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
