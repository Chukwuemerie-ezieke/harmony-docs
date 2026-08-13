import { ContextualLeadCta, type ToolCategory } from "@/components/contextual-lead-cta";
import { FileProcessingNotice, type ProcessingMode } from "@/components/file-processing-notice";

export function ToolExperience({ toolSlug, category, mode, showResultCta }: { toolSlug: string; category: ToolCategory; mode: ProcessingMode; showResultCta: boolean }) {
  return (
    <>
      <FileProcessingNotice mode={mode} />
      {showResultCta && <ContextualLeadCta category={category} toolSlug={toolSlug} />}
    </>
  );
}
