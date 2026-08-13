import { useState } from "react";
import { ToolPage } from "@/pages/tool-page";
import { downloadAsZip, downloadBlob, getPDFPageCount } from "@/lib/pdf-engine";
import { splitPdfByRanges } from "@/lib/pdf-release1-engine";
import { parsePageRanges } from "@/lib/pdf-release1";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      renderOptions={({ files, onProcess, status }) => {
        if (files[0] && !pageCount) void getPDFPageCount(files[0]).then(setPageCount);
        if (!files[0] && pageCount) setPageCount(0);
        return files.length > 0 && pageCount > 0 ? (
          <div>
            <Label>Custom ranges (optional)</Label>
            <Input
              value={rangesText}
              onChange={(event) => { setRangesText(event.target.value); setError(""); }}
              placeholder={`Leave blank for one file per page, or e.g. 1-3;4-6 (1-${pageCount})`}
            />
            {error && <p role="alert">{error}</p>}
            <Button onClick={onProcess} disabled={status === "processing"}>Split PDF</Button>
          </div>
        ) : null;
      }}
    >
      {() => null}
    </ToolPage>
  );
}
