import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/services/categories/types";
import { debounce } from "@/utils/debounce";
import { X } from "lucide-react";
import { useCallback } from "react";
import { ImportCsvDialog } from "./import-csv-dialog";
import { NewProductDialog } from "./new-product-dialog";

type ToolbarProps = {
  categories?: Category[];
  category?: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
};

export function Toolbar({
  categories,
  category,
  setCategory,
  setName,
}: ToolbarProps) {
  const debouncedSetName = useCallback(
    debounce((value: unknown) => {
      if (typeof value === "string") {
        setName(value);
      }
    }, 500),
    []
  );

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search products"
          onChange={(e) => debouncedSetName(e.target.value)}
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
