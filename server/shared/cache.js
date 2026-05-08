import { LRUCache } from 'lru-cache';

let feedCacheGeneration = 0;

export function bumpFeedCache() {
  feedCacheGeneration += 1;
}

export function feedCacheKey(page, limit) {
  return `feed:v${feedCacheGeneration}:${page}:${limit}`;
}

const feedTtlMs = () =>
  Math.min(120, Math.max(30, parseInt(process.env.FEED_CACHE_TTL_SEC || '60', 10))) * 1000;

const listTtlMs = () =>
  Math.min(300, Math.max(60, parseInt(process.env.LIST_CACHE_TTL_SEC || '120', 10))) * 1000;

export const feedLru = new LRUCache({
  max: 500,
  ttl: feedTtlMs(),
});

export const tagsLru = new LRUCache({
  max: 10,
  ttl: listTtlMs(),
});

export const categoriesLru = new LRUCache({
  max: 10,
  ttl: listTtlMs(),
});

export function invalidateTagsCache() {
  tagsLru.clear();
}

export function invalidateCategoriesCache() {
  categoriesLru.clear();
}
