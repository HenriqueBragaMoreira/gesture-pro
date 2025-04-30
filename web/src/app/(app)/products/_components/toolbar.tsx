import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  GetCategoriesResponse,
  Products,
} from "@/services/products/types";
import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { ImportCsvDialog } from "./import-csv-dialog";
import { NewProductDialog } from "./new-product-dialog";

type ToolbarProps = {
  table: Table<Products>;
  categories?: GetCategoriesResponse;
  category?: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
};

export function Toolbar({
  table,
  categories,
  category,
  setCategory,
}: ToolbarProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search products"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
        />

        <Select value={category} onValueChange={(value) => setCategory(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((item) => (
              <SelectItem key={item.id} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {category && (
          <Button
            variant="secondary"
            onClick={() => setCategory("")}
            size="icon"
          >
            <X />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ImportCsvDialog />

        <NewProductDialog />
      </div>
    </div>
  );
}
