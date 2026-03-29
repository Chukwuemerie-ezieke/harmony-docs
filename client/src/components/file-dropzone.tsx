import { useCallback, useState, useRef, useId } from "react";
import { Upload, FileText, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept: string[];
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  reorderable?: boolean;
}

export function FileDropzone({
  accept,
  multiple = false,
  files,
  onFilesChange,
  maxFiles = 50,
  reorderable = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputId = useId();

  const acceptStr = accept.join(",");

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles);
      const validFiles = arr.filter((f) => {
        const ext = `.${f.name.split(".").pop()?.toLowerCase()}`;
        return accept.includes(ext) || accept.includes(f.type);
      });
      if (multiple) {
        const combined = [...files, ...validFiles].slice(0, maxFiles);
        onFilesChange(combined);
      } else {
        onFilesChange(validFiles.slice(0, 1));
      }
    },
    [accept, files, multiple, maxFiles, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const handleReorderDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleReorderDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const newFiles = [...files];
    const [moved] = newFiles.splice(dragIndex, 1);
    newFiles.splice(targetIndex, 0, moved);
    onFilesChange(newFiles);
    setDragIndex(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {/* Drop zone — uses <label htmlFor> instead of programmatic .click() for iframe compatibility */}
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 sm:p-12 cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
        data-testid="file-dropzone"
      >
        <div className={cn(
          "rounded-full p-3 transition-colors",
          isDragging ? "bg-primary/10" : "bg-muted"
        )}>
          <Upload className={cn("h-6 w-6", isDragging ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {accept.join(", ")} {multiple ? `(up to ${maxFiles} files)` : "(1 file)"}
          </p>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={acceptStr}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            // Reset value so the same file can be re-selected
            e.target.value = "";
          }}
          className="sr-only"
          data-testid="file-input"
        />
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1.5" data-testid="file-list">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              draggable={reorderable}
              onDragStart={() => reorderable && handleReorderDragStart(i)}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                reorderable && handleReorderDrop(i);
              }}
              className={cn(
                "flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm transition-colors",
                reorderable && "cursor-grab active:cursor-grabbing",
                dragIndex === i && "opacity-40"
              )}
              data-testid={`file-item-${i}`}
            >
              {reorderable && (
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate flex-1 text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatSize(file.size)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                data-testid={`remove-file-${i}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
