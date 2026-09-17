import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { __resetDbForTests } from "@/lib/idb";
import {
  recordWork, getHistory, pruneHistory, deleteHistoryEntry, clearHistory,
  saveToolSettings, getToolSettings, clearWorkspace,
  HISTORY_TTL_MS, HISTORY_LIMIT,
} from "@/lib/workspace";

// Fresh IndexedDB per test so cases don't leak into each other.
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  __resetDbForTests();
});

describe("workspace history", () => {
  it("records and returns work newest-first", async () => {
    await recordWork({ toolId: "merge", outputName: "merged.pdf", outputBytes: 100 });
    await recordWork({ toolId: "compress", outputName: "compressed.pdf", outputBytes: 50 });
    const history = await getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].toolId).toBe("compress"); // newest first
    expect(history[1].toolId).toBe("merge");
  });

  it("stores only metadata (no document content)", async () => {
    await recordWork({ toolId: "merge", outputName: "merged.pdf", outputBytes: 100 });
    const [entry] = await getHistory();
    expect(Object.keys(entry).sort()).toEqual(
      ["completedAt", "id", "outputBytes", "outputName", "toolId"].sort(),
    );
  });

  it("excludes expired entries", async () => {
    await recordWork({ toolId: "merge", outputName: "merged.pdf", outputBytes: 100 });
    // Query far in the future so the entry is past its TTL.
    const future = Date.now() + HISTORY_TTL_MS + 1000;
    expect(await getHistory(future)).toHaveLength(0);
  });

  it("prunes down to the history limit", async () => {
    for (let i = 0; i < HISTORY_LIMIT + 5; i++) {
      await recordWork({ toolId: "merge", outputName: `out-${i}.pdf`, outputBytes: i });
    }
    const history = await getHistory();
    expect(history.length).toBeLessThanOrEqual(HISTORY_LIMIT);
  });

  it("pruneHistory removes expired entries from storage", async () => {
    await recordWork({ toolId: "merge", outputName: "merged.pdf", outputBytes: 100 });
    await pruneHistory(Date.now() + HISTORY_TTL_MS + 1000);
    expect(await getHistory()).toHaveLength(0);
  });

  it("deletes a single entry", async () => {
    await recordWork({ toolId: "merge", outputName: "merged.pdf", outputBytes: 100 });
    const [entry] = await getHistory();
    await deleteHistoryEntry(entry.id);
    expect(await getHistory()).toHaveLength(0);
  });

  it("clears all history", async () => {
    await recordWork({ toolId: "merge", outputName: "merged.pdf", outputBytes: 100 });
    await clearHistory();
    expect(await getHistory()).toHaveLength(0);
  });
});

describe("tool settings", () => {
  it("saves and reads settings for a tool", async () => {
    await saveToolSettings("watermark", { text: "DRAFT", opacity: 20 });
    const settings = await getToolSettings<{ text: string; opacity: number }>("watermark");
    expect(settings).toEqual({ text: "DRAFT", opacity: 20 });
  });

  it("returns undefined for a tool with no saved settings", async () => {
    expect(await getToolSettings("nope")).toBeUndefined();
  });

  it("overwrites settings on re-save", async () => {
    await saveToolSettings("watermark", { text: "A" });
    await saveToolSettings("watermark", { text: "B" });
    const settings = await getToolSettings<{ text: string }>("watermark");
    expect(settings?.text).toBe("B");
  });
});

describe("clearWorkspace", () => {
  it("wipes both history and settings", async () => {
    await recordWork({ toolId: "merge", outputName: "merged.pdf", outputBytes: 100 });
    await saveToolSettings("watermark", { text: "DRAFT" });
    await clearWorkspace();
    expect(await getHistory()).toHaveLength(0);
    expect(await getToolSettings("watermark")).toBeUndefined();
  });
});
