import type { ToolDefinition } from "@shared/schema";

export const tools: ToolDefinition[] = [
  { id: "merge", name: "Merge PDF", description: "Combine multiple PDFs into a single document", icon: "Layers", category: "organize", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400", route: "/tool/merge", acceptedTypes: [".pdf"], multiple: true },
  { id: "split", name: "Split PDF", description: "Separate a PDF into individual pages", icon: "Scissors", category: "organize", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", route: "/tool/split", acceptedTypes: [".pdf"], multiple: false },
  { id: "compress", name: "Compress PDF", description: "Reduce file size while maintaining quality", icon: "Minimize2", category: "organize", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", route: "/tool/compress", acceptedTypes: [".pdf"], multiple: false },
  { id: "organize", name: "Organize PDF", description: "Reorder, duplicate, delete, extract, and insert pages", icon: "Layers", category: "organize", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", route: "/tool/organize", acceptedTypes: [".pdf"], multiple: false },
  { id: "rearrange", name: "Rearrange Pages", description: "Change the order of pages in your PDF", icon: "RotateCw", category: "organize", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", route: "/tool/rearrange", acceptedTypes: [".pdf"], multiple: false },
  { id: "extract", name: "Extract Pages", description: "Extract specific pages into a new PDF", icon: "Layers", category: "organize", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", route: "/tool/extract", acceptedTypes: [".pdf"], multiple: false },
  { id: "delete", name: "Delete Pages", description: "Remove specific pages from your PDF", icon: "Scissors", category: "organize", color: "bg-red-500/10 text-red-600 dark:text-red-400", route: "/tool/delete", acceptedTypes: [".pdf"], multiple: false },
  { id: "rotate", name: "Rotate PDF", description: "Rotate pages to the correct orientation", icon: "RotateCw", category: "organize", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400", route: "/tool/rotate", acceptedTypes: [".pdf"], multiple: false },
  { id: "page-numbers", name: "Page Numbers", description: "Add page numbers to your document", icon: "Hash", category: "organize", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", route: "/tool/page-numbers", acceptedTypes: [".pdf"], multiple: false },
  { id: "img-to-pdf", name: "Image to PDF", description: "Convert images into a PDF document", icon: "ImagePlus", category: "convert", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", route: "/tool/img-to-pdf", acceptedTypes: [".jpg", ".jpeg", ".png"], multiple: true },
  { id: "pdf-to-img", name: "PDF to Image", description: "Convert PDF pages to image files", icon: "Image", category: "convert", color: "bg-teal-500/10 text-teal-600 dark:text-teal-400", route: "/tool/pdf-to-img", acceptedTypes: [".pdf"], multiple: false },
  { id: "pdf-to-images", name: "PDF to Images Pro", description: "Choose pages, format, resolution, and JPG quality", icon: "Image", category: "convert", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", route: "/tool/pdf-to-images", acceptedTypes: [".pdf"], multiple: false },
  { id: "html-to-pdf", name: "HTML File to PDF", description: "Prepare a safe local HTML preview for saving as PDF", icon: "Globe", category: "convert", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", route: "/tool/html-to-pdf", acceptedTypes: [".html", ".htm"], multiple: false },
  { id: "sign-pdf", name: "Sign PDF", description: "Draw or upload your signature to sign a PDF", icon: "PenTool", category: "edit", color: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400", route: "/tool/sign-pdf", acceptedTypes: [".pdf"], multiple: false },
  { id: "watermark", name: "Watermark", description: "Add text watermarks to your PDF", icon: "Droplets", category: "edit", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", route: "/tool/watermark", acceptedTypes: [".pdf"], multiple: false },
  { id: "add-text", name: "Add Text", description: "Overlay text on PDF pages", icon: "Type", category: "edit", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400", route: "/tool/add-text", acceptedTypes: [".pdf"], multiple: false },
  { id: "protect", name: "Protect PDF", description: "Add password protection to your PDF", icon: "Lock", category: "security", color: "bg-red-500/10 text-red-600 dark:text-red-400", route: "/tool/protect", acceptedTypes: [".pdf"], multiple: false },
  { id: "unlock", name: "Unlock PDF", description: "Remove password from a protected PDF", icon: "Unlock", category: "security", color: "bg-green-500/10 text-green-600 dark:text-green-400", route: "/tool/unlock", acceptedTypes: [".pdf"], multiple: false },
  { id: "compress-image", name: "Compress Image", description: "Compress JPG, PNG, or WebP with best quality", icon: "Minimize2", category: "image", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", route: "/tool/compress-image", acceptedTypes: [".jpg", ".jpeg", ".png", ".webp"], multiple: false },
  { id: "resize-image", name: "Resize Image", description: "Change the pixel dimensions of your image", icon: "Image", category: "image", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400", route: "/tool/resize-image", acceptedTypes: [".jpg", ".jpeg", ".png", ".webp"], multiple: false },
  { id: "crop-image", name: "Crop Image", description: "Crop and trim your image", icon: "Scissors", category: "image", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400", route: "/tool/crop-image", acceptedTypes: [".jpg", ".jpeg", ".png", ".webp"], multiple: false },
  { id: "rotate-image", name: "Rotate Image", description: "Rotate your images 90, 180 or 270 degrees", icon: "RotateCw", category: "image", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400", route: "/tool/rotate-image", acceptedTypes: [".jpg", ".jpeg", ".png", ".webp"], multiple: false },
  { id: "watermark-image", name: "Watermark Image", description: "Stamp an image or text over your images", icon: "Droplets", category: "image", color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", route: "/tool/watermark-image", acceptedTypes: [".jpg", ".jpeg", ".png", ".webp"], multiple: false },
];

export const categories = [
  { id: "organize", name: "Organize", description: "Arrange and restructure your documents" },
  { id: "convert", name: "Convert", description: "Transform between file formats" },
  { id: "edit", name: "Edit", description: "Modify and annotate your PDFs" },
  { id: "security", name: "Security", description: "Protect and unlock your documents" },
  { id: "image", name: "Image Tools", description: "Manipulate and enhance image files" },
] as const;

export function getToolById(id: string): ToolDefinition | undefined {
  return tools.find((tool) => tool.id === id);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return tools.filter((tool) => tool.category === category);
}
