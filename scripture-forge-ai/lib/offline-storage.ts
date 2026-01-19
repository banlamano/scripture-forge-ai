/**
 * Offline Storage using IndexedDB
 * Stores Bible translations locally for offline access
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";

interface BibleDBSchema extends DBSchema {
  verses: {
    key: string; // "translation-book-chapter-verse"
    value: {
      id: string;
      translation: string;
      book: string;
      chapter: number;
      verse: number;
      text: string;
    };
    indexes: {
      "by-translation": string;
      "by-chapter": [string, string, number];
    };
  };
  translations: {
    key: string;
    value: {
      id: string;
      name: string;
      abbreviation: string;
      downloadedAt: Date;
      verseCount: number;
    };
  };
  userContent: {
    key: string;
    value: {
      id: string;
      type: "bookmark" | "highlight" | "note";
      reference: string;
      data: Record<string, unknown>;
      syncedAt?: Date;
    };
    indexes: {
      "by-type": string;
    };
  };
}

let db: IDBPDatabase<BibleDBSchema> | null = null;

async function getDB(): Promise<IDBPDatabase<BibleDBSchema>> {
  if (db) return db;

  db = await openDB<BibleDBSchema>("scripture-forge", 1, {
    upgrade(database) {
      // Verses store
      const verseStore = database.createObjectStore("verses", {
        keyPath: "id",
      });
      verseStore.createIndex("by-translation", "translation");
      verseStore.createIndex("by-chapter", ["translation", "book", "chapter"]);

      // Translations store
      database.createObjectStore("translations", {
        keyPath: "id",
      });

      // User content store
      const userStore = database.createObjectStore("userContent", {
        keyPath: "id",
      });
      userStore.createIndex("by-type", "type");
    },
  });

  return db;
}

/**
 * Store verses for offline access
 */
export async function storeVerses(
  verses: Array<{
    translation: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
  }>
): Promise<void> {
  const database = await getDB();
  const tx = database.transaction("verses", "readwrite");

  await Promise.all(
    verses.map((v) => {
      const id = `${v.translation}-${v.book}-${v.chapter}-${v.verse}`;
      return tx.store.put({ ...v, id });
    })
  );

  await tx.done;
}

/**
 * Get verses for a chapter from offline storage
 */
export async function getOfflineChapter(
  translation: string,
  book: string,
  chapter: number
): Promise<Array<{ verse: number; text: string }> | null> {
  const database = await getDB();
  const verses = await database.getAllFromIndex(
    "verses",
    "by-chapter",
    [translation, book, chapter]
  );

  if (verses.length === 0) return null;

  return verses
    .sort((a, b) => a.verse - b.verse)
    .map((v) => ({ verse: v.verse, text: v.text }));
}

/**
 * Check if a translation is downloaded
 */
export async function isTranslationDownloaded(
  translationId: string
): Promise<boolean> {
  const database = await getDB();
  const translation = await database.get("translations", translationId);
  return !!translation;
}

/**
 * Mark translation as downloaded
 */
export async function markTranslationDownloaded(
  translationId: string,
  name: string,
  abbreviation: string,
  verseCount: number
): Promise<void> {
  const database = await getDB();
  await database.put("translations", {
    id: translationId,
    name,
    abbreviation,
    downloadedAt: new Date(),
    verseCount,
  });
}

/**
 * Get all downloaded translations
 */
export async function getDownloadedTranslations(): Promise<
  Array<{ id: string; name: string; abbreviation: string }>
> {
  const database = await getDB();
  return database.getAll("translations");
}

/**
 * Store user content for offline access
 */
export async function storeUserContent(
  type: "bookmark" | "highlight" | "note",
  reference: string,
  data: Record<string, unknown>
): Promise<string> {
  const database = await getDB();
  const id = `${type}-${reference}-${Date.now()}`;
  
  await database.put("userContent", {
    id,
    type,
    reference,
    data,
  });

  return id;
}

/**
 * Get all user content of a type
 */
export async function getUserContent(
  type: "bookmark" | "highlight" | "note"
): Promise<Array<{ id: string; reference: string; data: Record<string, unknown> }>> {
  const database = await getDB();
  return database.getAllFromIndex("userContent", "by-type", type);
}

/**
 * Delete user content
 */
export async function deleteUserContent(id: string): Promise<void> {
  const database = await getDB();
  await database.delete("userContent", id);
}

/**
 * Clear all offline data
 */
export async function clearOfflineData(): Promise<void> {
  const database = await getDB();
  
  const tx = database.transaction(
    ["verses", "translations", "userContent"],
    "readwrite"
  );
  
  await Promise.all([
    tx.objectStore("verses").clear(),
    tx.objectStore("translations").clear(),
    tx.objectStore("userContent").clear(),
  ]);
  
  await tx.done;
}

/**
 * Get storage usage estimate
 */
export async function getStorageUsage(): Promise<{
  used: number;
  quota: number;
  percentage: number;
}> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const quota = estimate.quota || 0;
    return {
      used,
      quota,
      percentage: quota > 0 ? (used / quota) * 100 : 0,
    };
  }
  return { used: 0, quota: 0, percentage: 0 };
}
