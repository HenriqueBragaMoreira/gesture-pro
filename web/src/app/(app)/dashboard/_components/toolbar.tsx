import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/services/categories/types";
import { dashboardService } from "@/services/dashboard";
import { useMutation } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ToolbarProps = {
  categories: Category[];
  category: string;
  setCategory: (category: string) => void;
};

export function Toolbar({ categories, category, setCategory }: ToolbarProps) {
  const { mutate: downloadExportedCsv, isPending } = useMutation({
    mutationFn: async () => {
      const response = await dashboardService.downloadExportedCSV();

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "sales_with_products.csv";
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },

    onError: () => {
      toast.error("Failed to export CSV");
    },

    onSuccess: () => {
      toast.success("CSV exported successfully");
    },
  });

  return (
    <div className="flex justify-between items-center">
      <Select value={category} onValueChange={(value) => setCategory(value)}>
        <SelectTrigger disabled={isPending} className="w-72">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories?.map((item) => (
            <SelectItem key={item.id} value={item.id.toString()}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={() => downloadExportedCsv()} disabled={isPending}>
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download />
        )}
        Download CSV
      </Button>
    </div>
  );
}
