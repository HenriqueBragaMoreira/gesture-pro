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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { GetCategoriesResponse } from "@/services/categories/types";
import { productsService } from "@/services/products";
import type { Products } from "@/services/products/types";
import { masks } from "@/utils/mask";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const productFormSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.string().min(0),
  brand: z.string().min(1),
  description: z.string().min(1),
});

type ProductFormSchemaType = z.infer<typeof productFormSchema>;

type NewProductFormProps = {
  product?: Products;
};

export function NewProductForm({ product }: NewProductFormProps) {
  const client = useQueryClient();

  const form = useForm<ProductFormSchemaType>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      category: product?.category.id.toString() || "",
      price: product?.price.toString() || "",
      brand: product?.brand || "",
      description: product?.description || "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["createProduct"],
    mutationFn: async (data: ProductFormSchemaType) => {
      await productsService.createProduct(data);
    },

    onError() {
      toast.error("Error creating product. Please try again.");
    },

    onSuccess() {
      toast.success("Product created successfully!");
      client.invalidateQueries({ queryKey: ["products"] });

      handleCloseDialog();
    },
  });

  const categories = client.getQueryData<GetCategoriesResponse>(["categories"]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutate(data))}
        className="grid gap-4 py-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Type the product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.categories?.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="$0,00"
                    {...field}
                    onChange={(e) => {
                      field.onChange(masks.price(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input placeholder="Type the brand name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Type the product description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
