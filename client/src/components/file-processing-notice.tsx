export type ProcessingMode = "browser" | "server" | "unknown";
export interface FileProcessingNoticeProps { mode: ProcessingMode; retentionMessage?: string; privacyHref?: string; className?: string; }
const messages: Record<ProcessingMode, string> = {
  browser: "This tool processes files in your browser. Your files are not sent to a HarmonyDocs processing server for this action.",
  server: "This tool sends files to a HarmonyDocs processing service. Review the stated retention period before uploading.",
  unknown: "Review this tool's processing information before uploading. Do not upload files you are not authorised to process.",
};
export function FileProcessingNotice({ mode, retentionMessage, privacyHref = "/privacy", className }: FileProcessingNoticeProps) { return <aside className={className} aria-label="File-processing information"><p>{messages[mode]}</p>{retentionMessage && <p>{retentionMessage}</p>}<p><a href={privacyHref}>Read the HarmonyDocs privacy notice</a>.</p></aside>; }
