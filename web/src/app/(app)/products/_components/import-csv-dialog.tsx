import { InputFile } from "@/components/inputFile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  handleCloseDialog,
} from "@/components/ui/dialog";
import { productsService } from "@/services/products";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ImportCsvDialog() {
  const [value, setValue] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const { mutate: importProducts, isPending } = useMutation({
    mutationKey: ["importProducts"],

    mutationFn: async () => {
      const response = await productsService.importProducts(value as File);

      return response;
    },

    onError() {
      toast.error("Error importing products. Please try again.");
    },

    onSuccess(data) {
      console.log(data);
      toast.success("Products imported successfully!");
      if (data.db_errors.length > 0) {
        toast.warning(
          `Products from lines ${data.db_errors.map(
            (error) => error.index + 2
          )} were not imported.`
        );
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      handleCloseDialog();
      setValue(null);
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>
            Import a CSV file to add new products to the database.
          </DialogDescription>
        </DialogHeader>

        <InputFile
          value={value}
          onChange={(file) => {
            setValue(file);
          }}
          onDelete={() => {
            setValue(null);
          }}
          accept=".csv"
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" type="button" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => importProducts()}
            disabled={value === null || isPending}
            type="submit"
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
