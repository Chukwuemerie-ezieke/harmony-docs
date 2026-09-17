import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BatchFileQueue } from "@/components/batch-file-queue";

function file(name: string): File {
  return new File([new Uint8Array([1])], name, { type: "application/pdf" });
}

describe("BatchFileQueue", () => {
  it("renders one accessible row per file", () => {
    render(<BatchFileQueue files={[file("a.pdf"), file("b.pdf")]} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Move a.pdf later")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove b.pdf")).toBeInTheDocument();
  });

  it("moves a file later via the keyboard-accessible button", async () => {
    const onChange = vi.fn();
    render(<BatchFileQueue files={[file("a.pdf"), file("b.pdf")]} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Move a.pdf later"));
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as File[];
    expect(next.map((f) => f.name)).toEqual(["b.pdf", "a.pdf"]);
  });

  it("removes a file", async () => {
    const onChange = vi.fn();
    render(<BatchFileQueue files={[file("a.pdf"), file("b.pdf")]} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Remove a.pdf"));
    const next = onChange.mock.calls[0][0] as File[];
    expect(next.map((f) => f.name)).toEqual(["b.pdf"]);
  });

  it("clears the whole queue", async () => {
    const onChange = vi.fn();
    render(<BatchFileQueue files={[file("a.pdf")]} onChange={onChange} />);
    await userEvent.click(screen.getByTestId("clear-queue"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("disables move-earlier on the first item and move-later on the last", () => {
    render(<BatchFileQueue files={[file("a.pdf"), file("b.pdf")]} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Move a.pdf earlier")).toBeDisabled();
    expect(screen.getByLabelText("Move b.pdf later")).toBeDisabled();
  });
});
