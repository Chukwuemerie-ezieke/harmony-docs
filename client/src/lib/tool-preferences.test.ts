import { describe, it, expect, beforeEach } from "vitest";
import {
  getFavorites, toggleFavorite, isFavorite,
  getRecents, recordRecent, clearRecents, RECENTS_LIMIT,
} from "@/lib/tool-preferences";

beforeEach(() => {
  window.localStorage.clear();
});

describe("favorites", () => {
  it("starts empty", () => {
    expect(getFavorites()).toEqual([]);
  });

  it("toggles a favorite on and off", () => {
    expect(toggleFavorite("merge")).toEqual(["merge"]);
    expect(isFavorite("merge")).toBe(true);
    expect(toggleFavorite("merge")).toEqual([]);
    expect(isFavorite("merge")).toBe(false);
  });

  it("keeps multiple favorites", () => {
    toggleFavorite("merge");
    toggleFavorite("split");
    expect(getFavorites()).toEqual(["merge", "split"]);
  });
});

describe("recents", () => {
  it("records most-recent first and de-duplicates", () => {
    recordRecent("merge");
    recordRecent("split");
    recordRecent("merge");
    expect(getRecents()).toEqual(["merge", "split"]);
  });

  it("caps at the recents limit", () => {
    for (let i = 0; i < RECENTS_LIMIT + 5; i++) {
      recordRecent(`tool-${i}`);
    }
    expect(getRecents()).toHaveLength(RECENTS_LIMIT);
    // Newest first.
    expect(getRecents()[0]).toBe(`tool-${RECENTS_LIMIT + 4}`);
  });

  it("clears recents", () => {
    recordRecent("merge");
    clearRecents();
    expect(getRecents()).toEqual([]);
  });

  it("tolerates corrupt storage", () => {
    window.localStorage.setItem("harmonydocs-recents", "not json");
    expect(getRecents()).toEqual([]);
  });
});
