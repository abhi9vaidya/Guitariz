// Lightweight IndexedDB cache for analysis results
type CachedAnalysis = {
  result: unknown;
  instrumentalUrl?: string;
  ts: number;
  ttl?: number; // ms
};

const DB_NAME = "guitariz-cache";
const STORE_NAME = "analyses";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedAnalysis(key: string): Promise<CachedAnalysis | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        resolve((req.result as CachedAnalysis) ?? null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("analysisCache:getCachedAnalysis error", err);
    return null;
  }
}

export async function setCachedAnalysis(key: string, data: { result: unknown; instrumentalUrl?: string }, ttlMs = 1000 * 60 * 60 * 24 * 30) {
  try {
    const db = await openDb();
    const payload: CachedAnalysis = { result: data.result, instrumentalUrl: data.instrumentalUrl, ts: Date.now(), ttl: ttlMs };
    return await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(payload, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("analysisCache:setCachedAnalysis error", err);
  }
}

export async function deleteCachedAnalysis(key: string) {
  try {
    const db = await openDb();
    return await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("analysisCache:deleteCachedAnalysis error", err);
  }
}

export function isExpired(cached: CachedAnalysis | null) {
  if (!cached) return true;
  if (!cached.ts) return true;
  const ttl = cached.ttl ?? 0;
  return Date.now() - cached.ts > ttl;
}
