import { ToolPage } from "@/pages/tool-page";
import { compressPDF, downloadBlob } from "@/lib/pdf-engine";

export default function CompressTool() {
  return (
    <ToolPage
      toolId="compress"
      onProcess={async (files) => {
        const original = files[0].size;
        const data = await compressPDF(files[0]);
        const compressed = data.length;
        const reduction = Math.round((1 - compressed / original) * 100);
        const msg = reduction > 0
          ? `Compressed: ${(original / 1024).toFixed(0)} KB → ${(compressed / 1024).toFixed(0)} KB (${reduction}% smaller)`
          : `Optimized to ${(compressed / 1024).toFixed(0)} KB`;
        return { data, message: msg };
      }}
      onDownload={(data) => downloadBlob(data, "compressed.pdf")}
      downloadLabel="Download compressed PDF"
    >
      {() => null}
    </ToolPage>
  );
}
