/**
 * Offline data store using IndexedDB.
 * Provides local caching for all entity types and a mutation queue
 * for operations performed while offline.
 */

const DB_NAME = 'todoless-offline';
const DB_VERSION = 1;

export type EntityCollection =
  | 'tasks'
  | 'items'
  | 'notes'
  | 'labels'
  | 'shops'
  | 'sprints'
  | 'calendar_events'
  | 'rewards'
  | 'goals'
  | 'projects'
  | 'settings'
  | 'users';

export interface QueuedMutation {
  id: string;
  collection: EntityCollection;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  recordId?: string; // for update/delete: which record to apply to
  timestamp: number;
}

const COLLECTIONS: EntityCollection[] = [
  'tasks', 'items', 'notes', 'labels', 'shops',
  'sprints', 'calendar_events', 'rewards', 'goals',
  'projects', 'settings', 'users',
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Create object store for each collection
      for (const collection of COLLECTIONS) {
        if (!db.objectStoreNames.contains(collection)) {
          db.createObjectStore(collection, { keyPath: 'id' });
        }
      }
      // Mutation queue store
      if (!db.objectStoreNames.contains('_mutations')) {
        db.createObjectStore('_mutations', { keyPath: 'id' });
      }
    };
  });
}

async function withStore<T>(
  collection: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(collection, mode);
    const store = tx.objectStore(collection);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Data operations ---

export async function getCollection<T>(collection: EntityCollection): Promise<T[]> {
  try {
    return withStore(collection, 'readonly', (store) => store.getAll());
  } catch {
    return [];
  }
}

export async function getRecord<T>(collection: EntityCollection, id: string): Promise<T | undefined> {
  try {
    return withStore(collection, 'readonly', (store) => store.get(id));
  } catch {
    return undefined;
  }
}

export async function putRecord(collection: EntityCollection, record: any): Promise<void> {
  try {
    await withStore(collection, 'readwrite', (store) => store.put(record));
  } catch (e) {
    console.error(`offline-store: putRecord ${collection}/${record.id} failed`, e);
  }
}

export async function deleteRecord(collection: EntityCollection, id: string): Promise<void> {
  try {
    await withStore(collection, 'readwrite', (store) => store.delete(id));
  } catch (e) {
    console.error(`offline-store: deleteRecord ${collection}/${id} failed`, e);
  }
}

export async function clearCollection(collection: EntityCollection): Promise<void> {
  try {
    await withStore(collection, 'readwrite', (store) => store.clear());
  } catch (e) {
    console.error(`offline-store: clearCollection ${collection} failed`, e);
  }
}

export async function putAll(collection: EntityCollection, records: any[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(collection, 'readwrite');
    const store = tx.objectStore(collection);
    // Clear and repopulate
    store.clear();
    for (const record of records) {
      store.put(record);
    }
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// --- Mutation queue ---

export async function enqueueMutation(
  collection: EntityCollection,
  operation: 'create' | 'update' | 'delete',
  payload: any,
  recordId?: string,
): Promise<QueuedMutation> {
  const mutation: QueuedMutation = {
    id: crypto.randomUUID(),
    collection,
    operation,
    payload,
    recordId,
    timestamp: Date.now(),
  };
  await withStore('_mutations', 'readwrite', (store) => store.put(mutation));
  return mutation;
}

export async function getQueuedMutations(): Promise<QueuedMutation[]> {
  try {
    return withStore('_mutations', 'readonly', (store) => store.getAll());
  } catch {
    return [];
  }
}

export async function dequeueMutation(id: string): Promise<void> {
  try {
    await withStore('_mutations', 'readwrite', (store) => store.delete(id));
  } catch (e) {
    console.error(`offline-store: dequeueMutation ${id} failed`, e);
  }
}

export async function clearMutationQueue(): Promise<void> {
  try {
    await withStore('_mutations', 'readwrite', (store) => store.clear());
  } catch (e) {
    console.error('offline-store: clearMutationQueue failed', e);
  }
}

export async function hasPendingMutations(): Promise<boolean> {
  const mutations = await getQueuedMutations();
  return mutations.length > 0;
}

// --- Bulk cache update (called after successful sync) ---

export async function syncSuccess(
  collection: EntityCollection,
  serverRecords: any[],
): Promise<void> {
  await putAll(collection, serverRecords);
}

// --- Initialize empty stores ---

export async function initStore(): Promise<void> {
  await openDB(); // triggers onupgradeneeded if needed
}
