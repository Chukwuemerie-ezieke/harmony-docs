export type PdfImageFormat = "png" | "jpeg";

export interface PdfImageExportOptions {
  format: PdfImageFormat;
  scale: number;
  quality: number;
}

export function PdfExportControls({ options, onChange }: { options: PdfImageExportOptions; onChange: (options: PdfImageExportOptions) => void }) {
  return (
    <fieldset>
      <legend>Image export options</legend>
      <label>
        Format
        <select value={options.format} onChange={(event) => onChange({ ...options, format: event.target.value as PdfImageFormat })}>
          <option value="png">PNG</option>
          <option value="jpeg">JPG</option>
        </select>
      </label>
      <label>
        Resolution
        <select value={options.scale} onChange={(event) => onChange({ ...options, scale: Number(event.target.value) })}>
          <option value={1}>Standard</option>
          <option value={2}>High</option>
          <option value={3}>Very high</option>
        </select>
      </label>
      {options.format === "jpeg" && (
        <label>
          JPG quality
          <input type="range" min={0.5} max={1} step={0.05} value={options.quality} onChange={(event) => onChange({ ...options, quality: Number(event.target.value) })} />
          <span>{Math.round(options.quality * 100)}%</span>
        </label>
      )}
    </fieldset>
  );
}
