import type { ToolDefinition } from "@shared/schema";

export const tools: ToolDefinition[] = [
  // Organize
  {
    id: "merge",
    name: "Merge PDF",
    description: "Combine multiple PDFs into a single document",
    icon: "Layers",
    category: "organize",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    route: "/tool/merge",
    acceptedTypes: [".pdf"],
    multiple: true,
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Separate a PDF into individual pages",
    icon: "Scissors",
    category: "organize",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    route: "/tool/split",
    acceptedTypes: [".pdf"],
    multiple: false,
  },
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce file size while maintaining quality",
    icon: "Minimize2",
    category: "organize",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    route: "/tool/compress",
    acceptedTypes: [".pdf"],
    multiple: false,
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    description: "Rotate pages to the correct orientation",
    icon: "RotateCw",
    category: "organize",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    route: "/tool/rotate",
    acceptedTypes: [".pdf"],
    multiple: false,
  },
  {
    id: "page-numbers",
    name: "Page Numbers",
    description: "Add page numbers to your document",
    icon: "Hash",
    category: "organize",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    route: "/tool/page-numbers",
    acceptedTypes: [".pdf"],
    multiple: false,
  },
  // Convert
  {
    id: "img-to-pdf",
    name: "Image to PDF",
    description: "Convert images into a PDF document",
    icon: "ImagePlus",
    category: "convert",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    route: "/tool/img-to-pdf",
    acceptedTypes: [".jpg", ".jpeg", ".png"],
    multiple: true,
  },
  {
    id: "pdf-to-img",
    name: "PDF to Image",
    description: "Convert PDF pages to image files",
    icon: "Image",
    category: "convert",
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    route: "/tool/pdf-to-img",
    acceptedTypes: [".pdf"],
    multiple: false,
  },
  {
    id: "html-to-pdf",
    name: "HTML to PDF",
    description: "Convert web pages to PDF format",
    icon: "Globe",
    category: "convert",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    route: "/tool/html-to-pdf",
    acceptedTypes: [".html", ".htm"],
    multiple: false,
  },
  // Edit
  {
    id: "watermark",
    name: "Watermark",
    description: "Add text watermarks to your PDF",
    icon: "Droplets",
    category: "edit",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    route: "/tool/watermark",
    acceptedTypes: [".pdf"],
    multiple: false,
  },
  {
    id: "add-text",
    name: "Add Text",
    description: "Overlay text on PDF pages",
    icon: "Type",
    category: "edit",
    color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    route: "/tool/add-text",
    acceptedTypes: [".pdf"],
    multiple: false,
  },
  // Security
  {
    id: "protect",
    name: "Protect PDF",
    description: "Add password protection to your PDF",
    icon: "Lock",
    category: "security",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
    route: "/tool/protect",
    acceptedTypes: [".pdf"],
    multiple: false,
  },
  {
    id: "unlock",
    name: "Unlock PDF",
    description: "Remove password from a protected PDF",
    icon: "Unlock",
    category: "security",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
    route: "/tool/unlock",
    acceptedTypes: [".pdf"],
    multiple: false,
  },
];

export const categories = [
  { id: "organize", name: "Organize", description: "Arrange and restructure your documents" },
  { id: "convert", name: "Convert", description: "Transform between file formats" },
  { id: "edit", name: "Edit", description: "Modify and annotate your PDFs" },
  { id: "security", name: "Security", description: "Protect and unlock your documents" },
] as const;

export function getToolById(id: string): ToolDefinition | undefined {
  return tools.find((t) => t.id === id);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return tools.filter((t) => t.category === category);
}
