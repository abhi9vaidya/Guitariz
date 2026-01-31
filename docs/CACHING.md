Caching strategy — Guitariz

Overview
- Purpose: Cache chord analysis results locally to reduce backend load, speed up repeat analyses, and enable offline re-use.

What we cache
- AnalysisResult objects produced by `useChordAnalysis` (chord timeline, tempo, key, metadata).
- Optional `instrumentalUrl` when vocal separation is used (note: remote URLs remain hosted on backend; cache stores the URL string).

Implementation
- `src/lib/analysisCache.ts` — small IndexedDB wrapper exposing `getCachedAnalysis`, `setCachedAnalysis`, `deleteCachedAnalysis`, and `isExpired`.
- TTL: default 30 days; configurable by changing `ttlMs` when calling `setCachedAnalysis`.
- Cache key: by default uses `file.name::file.size::file.lastModified::separateVocals::useMadmom` as a stable identifier. You can pass a custom `cacheKey` to `useChordAnalysis` to override.

Behavior
- `useChordAnalysis` will read cached results before running remote/local analysis and return the cached result if fresh.
- After successful analysis (remote or local), the result is persisted to IndexedDB using the resolved cache key.
- Cache operations are best-effort and will not block analysis; errors are logged to console.

Notes & Next steps
- Audio blobs are NOT cached yet. Consider using the Cache Storage API to store audio files (by content-hash) for offline playback.
- Add metrics (cache hit/miss counters) for monitoring and to tune TTL/invalidations.
- Consider adding a cache migration/versioning scheme if `AnalysisResult` shape changes.

How to clear cache (dev)
- Use browser DevTools -> Application -> IndexedDB -> `guitariz-cache` -> `analyses` -> delete keys.
- Programmatically call `deleteCachedAnalysis(key)`.

