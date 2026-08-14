import { useEffect, useRef, useState } from "react";

export type QueuedFile = {
  id: string;
  file: File;
  preview?: string;
};

type BatchFileQueueProps = {
  files: File[];
  accept?: "images" | "pdfs" | "files";
  onChange: (files: File[]) => void;
  title?: string;
};

function isImage(file: File) {
  return file.type.startsWith("image/");
}

export function BatchFileQueue({ files, accept = "files", onChange, title = "File queue" }: BatchFileQueueProps) {
  const [items, setItems] = useState<QueuedFile[]>([]);
  const draggedIndex = useRef<number | null>(null);

  useEffect(() => {
    const next = files.map((file, index) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
      file,
      preview: isImage(file) ? URL.createObjectURL(file) : undefined,
    }));
    setItems(next);
    return () => next.forEach((item) => item.preview && URL.revokeObjectURL(item.preview));
  }, [files]);

  function commit(next: QueuedFile[]) {
    setItems(next);
    onChange(next.map((item) => item.file));
  }

  function remove(id: string) {
    commit(items.filter((item) => item.id !== id));
  }

  function dropAt(target: number) {
    const source = draggedIndex.current;
    draggedIndex.current = null;
    if (source === null || source === target) return;
    const next = [...items];
    const [moved] = next.splice(source, 1);
    next.splice(target, 0, moved);
    commit(next);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  if (!items.length) return null;

  return (
    <section aria-label={title} className="space-y-3" data-testid="batch-file-queue">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{title} — {items.length} {items.length === 1 ? "file" : "files"}</p>
        <button type="button" className="text-sm underline" onClick={() => commit([])} data-testid="clear-queue">Clear all</button>
      </div>
      <p className="text-xs text-muted-foreground">Drag files to set the output order. The first item becomes the first page or document.</p>
      <ol className="grid gap-2 sm:grid-cols-2" aria-label="Queued files">
        {items.map((item, index) => (
          <li
            key={item.id}
            draggable
            onDragStart={() => { draggedIndex.current = index; }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropAt(index)}
            className="flex min-w-0 items-center gap-3 rounded-md border bg-card p-2"
            data-testid={`queue-item-${index}`}
          >
            <span className="w-6 text-center text-sm font-semibold text-muted-foreground" aria-label={`Position ${index + 1}`}>{index + 1}</span>
            {item.preview ? (
              <img src={item.preview} alt="" className="h-12 w-10 rounded object-cover" />
            ) : (
              <div className="flex h-12 w-10 items-center justify-center rounded bg-muted text-xs font-semibold" aria-hidden="true">PDF</div>
            )}
            <span className="min-w-0 flex-1 truncate text-sm" title={item.file.name}>{item.file.name}</span>
            <div className="flex items-center gap-1">
              <button type="button" aria-label={`Move ${item.file.name} earlier`} onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
              <button type="button" aria-label={`Move ${item.file.name} later`} onClick={() => move(index, 1)} disabled={index === items.length - 1}>↓</button>
              <button type="button" aria-label={`Remove ${item.file.name}`} onClick={() => remove(item.id)}>×</button>
            </div>
          </li>
        ))}
      </ol>
      {accept === "images" && <p className="text-xs text-muted-foreground">Each image will be placed on its own PDF page in the order shown.</p>}
    </section>
  );
}
