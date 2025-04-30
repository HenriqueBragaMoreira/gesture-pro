import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Products } from "@/services/products/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal } from "lucide-react";

export const columns: ColumnDef<Products>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: (cell) => {
      return cell.getValue<number>().toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    },
  },
  {
    accessorKey: "category.name",
    header: "Category",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger title="Mais ações">
            <MoreHorizontal size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Edit size={16} className="mr-1" /> Editar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
