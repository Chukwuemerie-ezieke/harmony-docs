/**
 * Minimal promise-based IndexedDB helper. Dependency-free so it adds nothing
 * to the bundle beyond a few hundred bytes. Used by the local document
 * workspace. All data stays on the user's device — nothing is uploaded.
 */

const DB_NAME = "harmonydocs";
const DB_VERSION = 1;

export const STORE_HISTORY = "history";
export const STORE_SETTINGS = "settings";

let dbPromise: Promise<IDBDatabase> | null = null;

function hasIndexedDB(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_HISTORY)) {
          const store = db.createObjectStore(STORE_HISTORY, { keyPath: "id" });
          store.createIndex("completedAt", "completedAt");
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: "toolId" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

function runTx<T>(
  store: string,
  mode: IDBTransactionMode,
  work: (objectStore: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const objectStore = tx.objectStore(store);
        let request: IDBRequest<T> | void;
        try {
          request = work(objectStore);
        } catch (err) {
          reject(err);
          return;
        }
        tx.oncomplete = () => resolve(request ? request.result : undefined);
        tx.onabort = () => reject(tx.error);
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export async function idbPut<T>(store: string, value: T): Promise<void> {
  if (!hasIndexedDB()) return;
  await runTx(store, "readwrite", (os) => os.put(value as unknown as Record<string, unknown>));
}

export async function idbGet<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  if (!hasIndexedDB()) return undefined;
  return runTx<T>(store, "readonly", (os) => os.get(key) as IDBRequest<T>);
}

export async function idbGetAll<T>(store: string): Promise<T[]> {
  if (!hasIndexedDB()) return [];
  const all = await runTx<T[]>(store, "readonly", (os) => os.getAll() as IDBRequest<T[]>);
  return all ?? [];
}

export async function idbDelete(store: string, key: IDBValidKey): Promise<void> {
  if (!hasIndexedDB()) return;
  await runTx(store, "readwrite", (os) => os.delete(key));
}

export async function idbClear(store: string): Promise<void> {
  if (!hasIndexedDB()) return;
  await runTx(store, "readwrite", (os) => os.clear());
}

/** Reset the cached connection — used by tests between cases. */
export function __resetDbForTests(): void {
  dbPromise = null;
}
