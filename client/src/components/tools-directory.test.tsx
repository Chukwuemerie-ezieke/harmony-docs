import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { ToolsDirectory } from "@/components/tools-directory";

vi.mock("@/lib/privacy-analytics", () => ({
  trackPublicEvent: vi.fn().mockResolvedValue(undefined),
}));

function renderDirectory() {
  return render(
    <Router hook={() => ["/", () => {}]}>
      <ToolsDirectory />
    </Router>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("ToolsDirectory", () => {
  it("shows category sections by default", () => {
    renderDirectory();
    expect(screen.getByTestId("tool-card-merge")).toBeInTheDocument();
    // No results grid until searching/filtering.
    expect(screen.queryByTestId("results-grid")).not.toBeInTheDocument();
  });

  it("filters to matching tools when searching", async () => {
    renderDirectory();
    await userEvent.type(screen.getByTestId("tools-search"), "password");
    const grid = await screen.findByTestId("results-grid");
    // Protect/Unlock mention password; merge should not appear.
    expect(within(grid).getByTestId("tool-card-protect")).toBeInTheDocument();
    expect(within(grid).queryByTestId("tool-card-merge")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    renderDirectory();
    await userEvent.type(screen.getByTestId("tools-search"), "zzzznope");
    expect(await screen.findByTestId("no-results")).toBeInTheDocument();
  });

  it("filters by category", async () => {
    renderDirectory();
    await userEvent.click(screen.getByTestId("category-security"));
    const grid = await screen.findByTestId("results-grid");
    expect(within(grid).getByTestId("tool-card-protect")).toBeInTheDocument();
    expect(within(grid).queryByTestId("tool-card-compress")).not.toBeInTheDocument();
  });

  it("adds a tool to favourites and surfaces a favourites row", async () => {
    renderDirectory();
    // Toggle favourite on the first merge card that appears.
    const toggles = screen.getAllByTestId("favorite-toggle-merge");
    await userEvent.click(toggles[0]);
    expect(await screen.findByTestId("favorites-row")).toBeInTheDocument();
  });
});
