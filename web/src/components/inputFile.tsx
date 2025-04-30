"use client";
import { useId } from "react";

import { cn } from "@/lib/utils";
import { FileText, Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface FileInputBaseProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  onDelete: () => void;
  accept?: string;
}

export type FileInputProps =
  | (FileInputBaseProps & {
      multiple?: false;
      value: File | null;
      onChange: (file: File | null) => void;
      classNameInput?: string;
    })
  | (FileInputBaseProps & {
      multiple: true;
      value: File[] | null;
      onChange: (file: File[] | null) => void;
      classNameInput?: string;
    });

export function InputFile({
  value,
  onChange,
  onDelete,
  accept,
  multiple,
  className,
  classNameInput,
  ...props
}: FileInputProps) {
  const uniqueId = useId();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (multiple) {
      onChange(files ? Array.from(files) : null);
    } else {
      onChange(files?.[0] || null);
    }
  };

  return (
    <>
      {!value || (Array.isArray(value) && value.length === 0) ? (
        <label
          data-slot="file-label"
          htmlFor={`file-input-${uniqueId}`}
          className={cn(
            "bg-input text-neutral hover:bg-input-hover flex h-14 cursor-pointer items-center gap-3 rounded-lg p-2 shadow-xs transition-colors",
            className
          )}
        >
          <div className="bg-neutral-soft border-main rounded-xl border p-2">
            <UploadCloud className="text-primary-soft" size={24} />
          </div>
          <span className="text-neutral-soft text-sm font-medium">
            {multiple ? "Selecione os arquivos" : "Selecione o arquivo"}
          </span>
          <Input
            id={`file-input-${uniqueId}`}
            type="file"
            className={cn("hidden", classNameInput)}
            multiple={multiple}
            accept={accept}
            onChange={handleFileChange}
            {...props}
          />
        </label>
      ) : (
        <div
          data-slot="file-container"
          className="bg-accent flex h-14 items-center justify-between rounded-lg p-2"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="bg-neutral-soft border-main rounded-xl border p-2">
              <FileText className="text-primary-soft shrink-0" size={24} />
            </div>
            <span
              title={
                Array.isArray(value)
                  ? value.length === 1
                    ? value[0]?.name
                    : `${value.length} arquivos selecionados`
                  : value.name
              }
              data-slot="file-text"
              className="text-neutral truncate text-sm font-medium"
            >
              {Array.isArray(value)
                ? `${value.length} arquivos selecionados`
                : value.name}
            </span>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="ml-2 w-8 shrink-0"
          >
            <Trash2 className="size-4" size={24} />
          </Button>
        </div>
      )}
    </>
  );
}
