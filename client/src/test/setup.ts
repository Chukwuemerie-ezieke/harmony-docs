import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

// Node 20/jsdom can miss the Iterator global required by pdfjs-dist.
if (typeof globalThis.Iterator === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Iterator = class Iterator {
    [Symbol.iterator]() {
      return this;
    }
  };
}

// React Testing Library: unmount and clean the DOM between tests.
afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia (used by the theme hook). Provide a plain
// (non-mock) stub so `restoreMocks` in the vitest config can't strip it between
// tests. Re-assert it before each test for safety.
function installMatchMedia() {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }),
  });
}
installMatchMedia();
beforeEach(() => {
  installMatchMedia();
});

// jsdom lacks these URL helpers used when creating/downloading blobs.
if (!URL.createObjectURL) {
  URL.createObjectURL = () => "blob:mock";
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = () => {};
}

// jsdom's Blob/File don't implement arrayBuffer(); several components read it.
if (typeof Blob !== "undefined" && !Blob.prototype.arrayBuffer) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Blob.prototype as any).arrayBuffer = function arrayBuffer() {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this as unknown as Blob);
    });
  };
}
