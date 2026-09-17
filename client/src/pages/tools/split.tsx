import { useEffect, useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadAsZip, downloadBlob } from "@/lib/pdf-engine";
import { splitPdfByRanges } from "@/lib/pdf-release1-engine";
import { parsePageRanges } from "@/lib/pdf-release1";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";

export default function SplitTool() {
  const [pageCount, setPageCount] = useState(0);
  const [rangesText, setRangesText] = useState("");
  const [error, setError] = useState("");

  return (
    <ToolPage
      toolId="split"
      onProcess={async (files) => {
        if (!rangesText.trim()) {
          const results = Array.from({ length: pageCount }, (_, index) => [index]);
          const output = await splitPdfByRanges(files[0], results);
          return { data: output, message: `Split into ${output.length} pages` };
        }
        const groups = rangesText.split(";").map((part) => part.trim()).filter(Boolean);
        const ranges = groups.map((group) => {
          const pages = parsePageRanges(group, pageCount);
          if (pages.length === 0) throw new Error(`No valid pages found in "${group}".`);
          return pages;
        });
        const output = await splitPdfByRanges(files[0], ranges);
        return { data: output, message: `Split into ${output.length} file(s)` };
      }}
      onDownload={(data) => data.length === 1 ? downloadBlob(data[0].data, data[0].name) : downloadAsZip(data, "split-pages.zip")}
      downloadLabel="Download pages (ZIP)"
      instructions={{
        title: "How to split a PDF",
        steps: [
          "Upload the PDF file you want to split.",
          "Leave the range field blank to split into one file per page, or enter ranges separated by semicolons (e.g. 1-3;4-6;7) to create custom groups.",
          "Download the resulting PDF or ZIP file.",
        ],
      }}
      faqs={[
        { question: "How are the split pages named?", answer: "Split files are named using the original file name plus a part number." },
        { question: "Will the quality be reduced?", answer: "No, splitting simply separates pages into new files without altering content quality." },
      ]}
      renderOptions={({ files, onProcess, status }) => (
        <SplitOptions
          file={files[0]}
          rangesText={rangesText}
          setRangesText={(v) => { setRangesText(v); setError(""); }}
          error={error}
          onPageCount={setPageCount}
          onProcess={onProcess}
          status={status}
        />
      )}
    >
      {() => null}
    </ToolPage>
  );
}

function SplitOptions({
  file, rangesText, setRangesText, error, onPageCount, onProcess, status,
}: {
  file: File | undefined;
  rangesText: string;
  setRangesText: (v: string) => void;
  error: string;
  onPageCount: (count: number) => void;
  onProcess: () => void;
  status: string;
}) {
  const { pageCount } = usePdfPageCount(file);
  useEffect(() => { onPageCount(pageCount); }, [pageCount, onPageCount]);
  if (!file || pageCount === 0) return null;
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="split-ranges" className="text-base">Custom ranges (optional)</Label>
        <Input
          id="split-ranges"
          value={rangesText}
          onChange={(event) => setRangesText(event.target.value)}
          placeholder={`Leave blank for one file per page, or e.g. 1-3;4-6 (1-${pageCount})`}
        />
        {error && <p className="text-sm text-destructive font-medium" role="alert">{error}</p>}
      </div>
      <Button onClick={onProcess} className="w-full" size="lg" disabled={status === "processing"} data-testid="process-btn">
        {status === "processing" ? "Splitting…" : "Split PDF"}
      </Button>
    </div>
  );
}
