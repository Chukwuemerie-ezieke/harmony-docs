import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { NextToolSuggestions } from "@/components/next-tool-suggestions";
import { consumeHandoff, clearHandoff } from "@/lib/tool-handoff";

vi.mock("@/lib/privacy-analytics", () => ({
  trackPublicEvent: vi.fn().mockResolvedValue(undefined),
}));

const navigate = vi.fn();

function renderSuggestions(props: { fromToolId: string; handoffFile?: File | null }) {
  return render(
    <Router hook={() => ["/", navigate]}>
      <NextToolSuggestions {...props} />
    </Router>,
  );
}

beforeEach(() => {
  clearHandoff();
  navigate.mockClear();
});

describe("NextToolSuggestions", () => {
  it("renders related tools for the source tool", () => {
    renderSuggestions({ fromToolId: "merge" });
    // merge relatedTools: compress, organize, protect
    expect(screen.getByTestId("next-tool-compress")).toBeInTheDocument();
    expect(screen.getByTestId("next-tool-protect")).toBeInTheDocument();
  });

  it("renders nothing for a tool with no related tools", () => {
    const { container } = renderSuggestions({ fromToolId: "not-a-real-tool" });
    expect(container).toBeEmptyDOMElement();
  });

  it("navigates to the next tool on click", async () => {
    renderSuggestions({ fromToolId: "merge" });
    await userEvent.click(screen.getByTestId("next-tool-compress"));
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][0]).toBe("/tool/compress");
  });

  it("stages the handoff file when the next tool accepts PDFs", async () => {
    const file = new File([new Uint8Array([1])], "merged.pdf", { type: "application/pdf" });
    renderSuggestions({ fromToolId: "merge", handoffFile: file });
    await userEvent.click(screen.getByTestId("next-tool-compress"));
    // The staged file should now be retrievable by the target tool.
    expect(consumeHandoff("compress")).toBe(file);
  });
});
