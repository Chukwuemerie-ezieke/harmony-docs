import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export type PdfImageFormat = "png" | "jpeg";

export interface PdfImageExportOptions {
  format: PdfImageFormat;
  scale: number;
  quality: number;
}

export function PdfExportControls({ options, onChange }: { options: PdfImageExportOptions; onChange: (options: PdfImageExportOptions) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold">Image export options</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select
            value={options.format}
            onValueChange={(value) => onChange({ ...options, format: value as PdfImageFormat })}
          >
            <SelectTrigger id="format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpeg">JPG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resolution">Resolution</Label>
          <Select
            value={String(options.scale)}
            onValueChange={(value) => onChange({ ...options, scale: Number(value) })}
          >
            <SelectTrigger id="resolution">
              <SelectValue placeholder="Select resolution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Standard</SelectItem>
              <SelectItem value="2">High</SelectItem>
              <SelectItem value="3">Very high</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {options.format === "jpeg" && (
        <div className="space-y-3 pt-2">
          <div className="flex justify-between">
            <Label>JPG Quality</Label>
            <span className="text-sm text-muted-foreground">{Math.round(options.quality * 100)}%</span>
          </div>
          <Slider
            min={0.5}
            max={1}
            step={0.05}
            value={[options.quality]}
            onValueChange={([value]) => onChange({ ...options, quality: value })}
          />
        </div>
      )}
    </div>
  );
}
