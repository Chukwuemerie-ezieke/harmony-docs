import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { IDBFactory } from "fake-indexeddb";
import { __resetDbForTests } from "@/lib/idb";
import { recordWork } from "@/lib/workspace";
import { RecentWork } from "@/components/recent-work";

vi.mock("@/lib/privacy-analytics", () => ({
  trackPublicEvent: vi.fn().mockResolvedValue(undefined),
}));

function renderRecentWork() {
  return render(
    <Router hook={() => ["/", () => {}]}>
      <RecentWork />
    </Router>,
  );
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  __resetDbForTests();
});

describe("RecentWork", () => {
  it("renders nothing when there is no history", async () => {
    const { container } = renderRecentWork();
    // Nothing to show once loaded.
    await waitFor(() => expect(container.querySelector('[data-testid="recent-work"]')).toBeNull());
  });

  it("lists recorded work with a known tool name", async () => {
    await recordWork({ toolId: "merge", outputName: "merged.pdf", outputBytes: 2048 });
    renderRecentWork();
    expect(await screen.findByText("merged.pdf")).toBeInTheDocument();
    expect(screen.getByText(/Merge PDF/)).toBeInTheDocument();
  });

  it("clears history when Clear is pressed", async () => {
    await recordWork({ toolId: "merge", outputName: "merged.pdf", outputBytes: 2048 });
    renderRecentWork();
    await screen.findByText("merged.pdf");
    await userEvent.click(screen.getByTestId("clear-history"));
    await waitFor(() => expect(screen.queryByText("merged.pdf")).not.toBeInTheDocument());
  });
});
