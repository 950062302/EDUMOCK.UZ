import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { StoredRecording } from './types';

const DB_NAME = 'MockTestDB';
const DB_VERSION = 2; // Increment DB version for schema change
const STORE_NAME = 'recordings';

interface MockTestDB extends DBSchema {
  [STORE_NAME]: {
    key: string; // timestamp
    value: StoredRecording;
  };
}

let dbPromise: Promise<IDBPDatabase<MockTestDB>> | null = null;

const getDb = (): Promise<IDBPDatabase<MockTestDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<MockTestDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // This upgrade function will run if the DB_VERSION is higher than the existing one.
        // It will delete the old data (with Supabase links) and create a new structure.
        if (oldVersion < 2) {
          if (db.objectStoreNames.contains(STORE_NAME)) {
            db.deleteObjectStore(STORE_NAME);
          }
          db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
        }
      },
    });
  }
  return dbPromise;
};

export const addRecordingToDB = async (recording: StoredRecording): Promise<void> => {
  const db = await getDb();
  await db.put(STORE_NAME, recording);
};

export const getAllRecordingsFromDB = async (): Promise<StoredRecording[]> => {
  const db = await getDb();
  // Get all and sort by timestamp descending to show newest first
  const recordings = await db.getAll(STORE_NAME);
  return recordings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const deleteRecordingFromDB = async (timestamp: string): Promise<void> => {
  const db = await getDb();
  await db.delete(STORE_NAME, timestamp);
};