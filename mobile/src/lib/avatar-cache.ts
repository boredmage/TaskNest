import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect } from "react";
import { create } from "zustand";

/**
 * Disk cache for avatar images so profile pictures render offline.
 *
 * Remote avatar URLs are downloaded once into the app's cache directory and
 * an index (url → local file) is kept in AsyncStorage. `useCachedAvatar`
 * hands components the local file when it exists and the remote URL until
 * then, re-rendering once the download lands. Avatar URLs carry a version
 * query when they change, so a new upload is a new cache entry.
 */
const DIR = `${FileSystem.cacheDirectory ?? ""}avatars/`;
const INDEX_KEY = "tasknest.avatar-cache.index";

interface CacheState {
  local: Record<string, string>;
}
const useCache = create<CacheState>(() => ({ local: {} }));

let ready: Promise<void> | null = null;
const inflight = new Map<string, Promise<void>>();

const isRemote = (url: string | null | undefined): url is string =>
  !!url && /^https?:\/\//.test(url);

/** Stable file name for a URL. */
function fileFor(url: string) {
  let h = 5381;
  for (let i = 0; i < url.length; i++)
    h = ((h << 5) + h + url.charCodeAt(i)) | 0;
  const ext = (
    url.split("?")[0]!.match(/\.(jpe?g|png|webp|gif|heic)$/i)?.[1] ?? "img"
  ).toLowerCase();
  return `${DIR}${(h >>> 0).toString(16)}.${ext}`;
}

/** Load the index and drop entries whose files are gone. Safe to call often. */
export function initAvatarCache(): Promise<void> {
  if (ready) return ready;
  ready = (async () => {
    if (!FileSystem.cacheDirectory) return;
    try {
      await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
      const raw = await AsyncStorage.getItem(INDEX_KEY);
      const index = raw ? (JSON.parse(raw) as Record<string, string>) : {};
      const local: Record<string, string> = {};
      await Promise.all(
        Object.entries(index).map(async ([url, file]) => {
          const info = await FileSystem.getInfoAsync(file).catch(() => null);
          if (info?.exists) local[url] = file;
        })
      );
      useCache.setState({ local });
    } catch (e) {
      console.warn("[avatar-cache] init failed", e);
    }
  })();
  return ready;
}

async function persistIndex() {
  try {
    await AsyncStorage.setItem(
      INDEX_KEY,
      JSON.stringify(useCache.getState().local)
    );
  } catch {
    /* best effort */
  }
}

/** Local file for `url` if it's cached, else null. */
export function cachedAvatar(url: string | null | undefined): string | null {
  if (!isRemote(url)) return null;
  return useCache.getState().local[url] ?? null;
}

/** Download `url` into the cache if it isn't there already. */
export function prefetchAvatar(url: string | null | undefined): Promise<void> {
  if (!isRemote(url) || !FileSystem.cacheDirectory) return Promise.resolve();
  if (useCache.getState().local[url]) return Promise.resolve();
  const pending = inflight.get(url);
  if (pending) return pending;
  const job = (async () => {
    await initAvatarCache();
    if (useCache.getState().local[url]) return;
    const file = fileFor(url);
    try {
      const res = await FileSystem.downloadAsync(url, file);
      if (res.status >= 200 && res.status < 300) {
        useCache.setState((s) => ({ local: { ...s.local, [url]: file } }));
        await persistIndex();
      }
    } catch {
      /* offline or bad URL: the remote URL keeps being used */
    } finally {
      inflight.delete(url);
    }
  })();
  inflight.set(url, job);
  return job;
}

/** Warm the cache for a batch of URLs (family members, notification senders). */
export function prefetchAvatars(urls: (string | null | undefined)[]) {
  for (const url of new Set(urls)) void prefetchAvatar(url);
}

/**
 * The URI to render for an avatar: the cached file when available, the
 * remote URL until then (and a download is started), or the input unchanged
 * for local `file://` / data URIs.
 */
export function useCachedAvatar(
  url: string | null | undefined
): string | undefined {
  const local = useCache((s) => (isRemote(url) ? s.local[url] : undefined));
  useEffect(() => {
    if (isRemote(url) && !local) void prefetchAvatar(url);
  }, [url, local]);
  return local ?? url ?? undefined;
}
