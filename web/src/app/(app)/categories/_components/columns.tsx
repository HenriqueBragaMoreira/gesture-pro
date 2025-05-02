"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Category } from "@/services/categories/types";
import { masks } from "@/utils/mask";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, MoreHorizontal } from "lucide-react";
import { CategoryDialog } from "./category-dialog";
export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <>{row.original.name}</>,
  },
  {
    accessorKey: "created_at",
    header: "Creation Date",
    cell: ({ row }) => (
      <>{masks.dateToString(new Date(row.original.created_at ?? ""))}</>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Update Date",
    cell: ({ row }) => (
      <>{masks.dateToString(new Date(row.original.updated_at ?? ""))}</>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const category = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger title="Mais ações">
            <MoreHorizontal size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <CategoryDialog id={category.id.toString()} edit={true}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit size={16} className="mr-1" /> Editar
              </DropdownMenuItem>
            </CategoryDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
