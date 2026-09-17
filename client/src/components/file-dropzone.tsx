import { useCallback, useState, useRef, useId } from "react";
import { Upload, FileText, X, GripVertical, AlertTriangle } from "lucide-react";
import { PdfPreview } from "./pdf-preview";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateFiles } from "@/lib/file-validation";

interface FileDropzoneProps {
  accept: string[];
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxFileBytes?: number;
  reorderable?: boolean;
  /** Validation notices to display (rejected/trimmed files). */
  notices?: string[];
  /** Called with new validation notices after a selection. */
  onNotices?: (notices: string[]) => void;
}

export function FileDropzone({
  accept,
  multiple = false,
  files,
  onFilesChange,
  maxFiles = 50,
  maxFileBytes = 100 * 1024 * 1024,
  reorderable = false,
  notices = [],
  onNotices,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const inputId = useId();

  const acceptStr = accept.join(",");

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const { accepted, rejections } = validateFiles(Array.from(newFiles), files, {
        acceptedTypes: accept,
        multiple,
        maxFiles,
        maxFileBytes,
      });
      onNotices?.(rejections);
      onFilesChange(accepted);
    },
    [accept, files, multiple, maxFiles, maxFileBytes, onFilesChange, onNotices]
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
    onNotices?.([]);
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
    <div className="space-y-6">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed p-12 sm:p-20 cursor-pointer transition-all duration-200 group shadow-sm bg-card",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/20"
        )}
        data-testid="file-dropzone"
      >
        <div className={cn(
          "rounded-full p-6 transition-all duration-300",
          isDragging ? "bg-primary/20 text-primary scale-110" : "bg-primary/10 text-primary group-hover:bg-primary/20"
        )}>
          <Upload className="h-10 w-10" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            Choose files <span className="font-normal text-muted-foreground hidden sm:inline">or drop them here</span>
          </p>
          <p className="text-sm text-muted-foreground font-medium">
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
            e.target.value = "";
          }}
          className="sr-only"
          data-testid="file-input"
        />
      </label>

      {notices.length > 0 && (
        <div
          className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
          role="status"
          aria-live="polite"
          data-testid="dropzone-notices"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <ul className="space-y-1">
            {notices.map((notice, index) => (
              <li key={index}>{notice}</li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 rounded-lg" data-testid="file-list">
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
                "flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm transition-all shadow-sm hover:border-primary/30",
                reorderable && "cursor-grab active:cursor-grabbing hover:bg-muted/30",
                dragIndex === i && "opacity-40"
              )}
              data-testid={`file-item-${i}`}
            >
              {reorderable && (
                <GripVertical className="h-5 w-5 text-muted-foreground/50 shrink-0" aria-hidden="true" />
              )}
              <div className="h-12 w-10 shrink-0">
                 {file.type === "application/pdf" ? (
                   <PdfPreview file={file} className="h-full w-full object-cover rounded shadow-sm" />
                 ) : (
                   <div className="h-full w-full rounded bg-primary/10 flex items-center justify-center">
                     <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                   </div>
                 )}
              </div>
              <span className="truncate flex-1 font-medium text-foreground">{file.name}</span>
              <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md shrink-0">
                {formatSize(file.size)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                aria-label={`Remove ${file.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                data-testid={`remove-file-${i}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
