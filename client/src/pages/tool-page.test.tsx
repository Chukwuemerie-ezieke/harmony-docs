import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToolPage } from "@/pages/tool-page";
import type { ProcessContext } from "@/lib/tool-workflow";
import { AppError } from "@/lib/tool-errors";

// Analytics performs network work; stub it so tests stay hermetic.
vi.mock("@/lib/privacy-analytics", () => ({
  trackPublicEvent: vi.fn().mockResolvedValue(undefined),
}));

function makePdf(name = "doc.pdf"): File {
  return new File([new Uint8Array([1, 2, 3, 4])], name, { type: "application/pdf" });
}

async function selectFile(file: File) {
  const input = screen.getByTestId("file-input") as HTMLInputElement;
  await userEvent.upload(input, file);
}

describe("ToolPage workflow", () => {
  it("runs the happy path: upload → process → done → download", async () => {
    const onProcess = vi.fn(async () => ({ data: new Uint8Array([9]), message: "Merged 1 file" }));
    const onDownload = vi.fn();

    render(
      <ToolPage toolId="merge" onProcess={onProcess} onDownload={onDownload} downloadLabel="Download merged PDF">
        {() => null}
      </ToolPage>,
    );

    await selectFile(makePdf());
    await userEvent.click(screen.getByTestId("process-btn"));

    await waitFor(() => expect(screen.getByText("Merged 1 file")).toBeInTheDocument());
    expect(onProcess).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByTestId("download-btn"));
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("passes a ProcessContext with signal and onProgress to the processor", async () => {
    let received: ProcessContext | undefined;
    const onProcess = vi.fn(async (_files: File[], ctx: ProcessContext) => {
      received = ctx;
      return { data: null, message: "ok" };
    });

    render(
      <ToolPage toolId="merge" onProcess={onProcess}>
        {() => null}
      </ToolPage>,
    );

    await selectFile(makePdf());
    await userEvent.click(screen.getByTestId("process-btn"));

    await waitFor(() => expect(received).toBeDefined());
    expect(received!.signal).toBeInstanceOf(AbortSignal);
    expect(typeof received!.onProgress).toBe("function");
  });

  it("shows a friendly error and offers retry, then succeeds on retry", async () => {
    let attempt = 0;
    const onProcess = vi.fn(async () => {
      attempt += 1;
      if (attempt === 1) throw new AppError("invalid_input", "Pages are out of range");
      return { data: new Uint8Array([1]), message: "Recovered" };
    });

    render(
      <ToolPage toolId="merge" onProcess={onProcess} onDownload={vi.fn()}>
        {() => null}
      </ToolPage>,
    );

    await selectFile(makePdf());
    await userEvent.click(screen.getByTestId("process-btn"));

    await waitFor(() => expect(screen.getByText("Pages are out of range")).toBeInTheDocument());

    await userEvent.click(screen.getByTestId("retry-btn"));
    await waitFor(() => expect(screen.getByText("Recovered")).toBeInTheDocument());
    expect(onProcess).toHaveBeenCalledTimes(2);
  });

  it("cancels an in-flight operation and returns to idle", async () => {
    // A processor that resolves only after its signal aborts.
    const onProcess = vi.fn(
      (_files: File[], ctx: ProcessContext) =>
        new Promise<{ data: unknown; message: string }>((resolve) => {
          ctx.signal.addEventListener("abort", () => resolve({ data: null, message: "late" }));
        }),
    );

    render(
      <ToolPage toolId="merge" onProcess={onProcess}>
        {() => null}
      </ToolPage>,
    );

    await selectFile(makePdf());
    await userEvent.click(screen.getByTestId("process-btn"));

    const cancel = await screen.findByTestId("cancel-btn");
    await userEvent.click(cancel);

    // After cancel we return to idle: the dropzone is shown again and no result banner appears.
    await waitFor(() => expect(screen.getByTestId("file-input")).toBeInTheDocument());
    expect(screen.queryByText("late")).not.toBeInTheDocument();
  });

  it("supports the children-as-processor path (organize) with a working download", async () => {
    // Mirrors OrganizePdfTool: the child pushes a result and marks done itself,
    // and ToolPage still surfaces the download because onDownload is provided.
    const onDownload = vi.fn();
    render(
      <ToolPage toolId="organize" onDownload={onDownload} downloadLabel="Download organised PDF">
        {({ files, setResult, setMessage, setStatus }) =>
          files[0] ? (
            <button
              type="button"
              data-testid="organize-complete"
              onClick={() => {
                setResult(new Uint8Array([7]));
                setMessage("PDF organised successfully.");
                setStatus("done");
              }}
            >
              Complete
            </button>
          ) : null
        }
      </ToolPage>,
    );

    await selectFile(makePdf());
    await userEvent.click(screen.getByTestId("organize-complete"));

    await waitFor(() => expect(screen.getByText("PDF organised successfully.")).toBeInTheDocument());
    const download = screen.getByTestId("download-btn");
    await userEvent.click(download);
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it("surfaces validation notices instead of silently dropping bad files", async () => {
    render(
      <ToolPage toolId="merge" onProcess={vi.fn()}>
        {() => null}
      </ToolPage>,
    );

    // merge accepts .pdf; feed a .txt via a raw change event (bypassing the
    // input's accept attribute) so our validation layer runs and reports it.
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    const bad = new File([new Uint8Array([1])], "notes.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [bad] } });

    const notices = await screen.findByTestId("dropzone-notices");
    expect(notices).toHaveTextContent(/isn.t a supported file type/);
  });
});
