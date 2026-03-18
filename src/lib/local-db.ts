import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { SpeakingQuestion, MoodEntry, RecordedSession, Part1_1Question, Part1_2Question, Part2Question, Part3Question } from './types';
import { pb } from "@/integrations/pocketbase/client";
import { showError } from '@/utils/toast';
import i18n from '@/i18n';

const DB_NAME = 'edumock_uz_db';
const DB_VERSION = 1;
const STORE_MOODS = 'mood_entries';
const STORE_RECORDINGS = 'recordings';

// IndexedDB uchun
let db: IDBPDatabase;

async function initDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_MOODS)) {
          db.createObjectStore(STORE_MOODS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_RECORDINGS)) {
          db.createObjectStore(STORE_RECORDINGS, { keyPath: 'id' });
        }
      },
    });
  }
  return db;
}

const getUserId = async (): Promise<string | null> => {
  const userId = pb.authStore.model?.id || null;
  console.log("[getUserId] Current authenticated user ID:", userId || "null");
  return userId;
};

// Helper to normalize sub_questions for comparison
const normalizeSubQuestions = (subQuestions: string[] | undefined): string => {
  if (!subQuestions) return '';
  return subQuestions.map(q => q.trim()).filter(Boolean).sort().join('|||');
};

// Duplicate check function
export const checkDuplicateQuestion = async (
  questionData: Omit<SpeakingQuestion, 'id' | 'date' | 'user_id'>,
  userId: string | null,
  excludeId?: string // Update uchun, o'zini tekshirmaslik
): Promise<boolean> => {
  try {
    // PocketBase filter: guest/public savollar uchun user_id bo'sh string deb qaraymiz.
    const ownerFilter = userId ? `user_id="${userId}"` : `user_id=""`;
    const typeFilter = `type="${questionData.type}"`;
    const data = await pb.collection("questions").getFullList({
      filter: `${ownerFilter} && ${typeFilter}`,
      requestKey: null,
    });

    if (!data || data.length === 0) return false;
  
  // Client-side comparison based on question type
  switch (questionData.type) {
    case "Part 1.1":
    case "Part 1.2": {
      const newNormalizedSubQuestions = normalizeSubQuestions((questionData as Part1_1Question | Part1_2Question).sub_questions);
      if (!newNormalizedSubQuestions) return false;
      
      return data.some((existingQ: any) => {
        if (excludeId && existingQ.id === excludeId) return false; // O'zini tekshirmaslik
        const existingNormalizedSubQuestions = normalizeSubQuestions((existingQ as any).sub_questions);
        return existingNormalizedSubQuestions === newNormalizedSubQuestions;
      });
    }
    case "Part 2":
    case "Part 3": {
      const newQuestionText = (questionData as Part2Question | Part3Question).question_text?.trim();
      if (!newQuestionText) return false; // Yangi matn bo'sh bo'lsa, takrorlanish bo'lishi mumkin emas
      
      return data.some((existingQ: any) => {
        if (excludeId && existingQ.id === excludeId) return false; // O'zini tekshirmaslik
        return String(existingQ.question_text || "").trim() === newQuestionText;
      });
    }
    default:
      return false;
  }
  } catch (e: any) {
    console.error("Error checking for duplicate questions:", e?.message || e);
    return false;
  }
};

export const getQuestions = async (): Promise<SpeakingQuestion[]> => {
  const userId = pb.authStore.model?.id;
  const isGuestMode = localStorage.getItem("isGuestMode") === "true"; // Mehmon rejimini tekshirish
  
  try {
    let filter = "";

    if (isGuestMode && !userId) {
      filter = `user_id=""`;
    } else if (userId) {
      filter = `user_id="${userId}"`;
    } else {
      return [];
    }

    const data = await pb.collection("questions").getFullList({
      filter,
      requestKey: null,
    });

    return data as unknown as SpeakingQuestion[];
  } catch (e: any) {
    showError(i18n.t("add_question_page.error_loading_entries", { message: e?.message || String(e) }));
    return [];
  }
};

export const addQuestion = async (question: Omit<SpeakingQuestion, 'id' | 'date' | 'user_id'>): Promise<SpeakingQuestion | null> => {
  const userId = pb.authStore.model?.id;
  
  if (!userId) {
    console.warn("Attempted to add a question without being authenticated. This action is blocked.");
    return null;
  }
  
  // Check for duplicate before adding
  const isDuplicate = await checkDuplicateQuestion(question, userId);
  if (isDuplicate) {
    showError(i18n.t("add_question_page.error_duplicate_question"));
    return null;
  }
  
  const newQuestion = {
    ...question,
    // NOTE: PocketBase record "id" is system-generated; do NOT send custom id.
    date: new Date().toISOString(),
    user_id: userId,
  };
  
  try {
    const data = await pb.collection("questions").create(newQuestion as any, { requestKey: null });
    return data as unknown as SpeakingQuestion;
  } catch (e: any) {
    showError(i18n.t("add_question_page.error_saving_entry", { message: e?.message || String(e) }));
    return null;
  }
};

export const updateQuestion = async (updatedQuestion: SpeakingQuestion): Promise<SpeakingQuestion | null> => {
  const userId = pb.authStore.model?.id;
  
  if (!userId) {
    console.warn("Attempted to update a question without being authenticated. This action is blocked.");
    return null;
  }
  
  // Check for duplicate before updating, excluding the current question being edited
  const isDuplicate = await checkDuplicateQuestion(updatedQuestion, userId, updatedQuestion.id);
  if (isDuplicate) {
    showError(i18n.t("add_question_page.error_duplicate_question"));
    return null;
  }
  
  try {
    // ensure ownership on client side
    if (updatedQuestion.user_id !== userId) {
      showError(i18n.t("add_question_page.error_saving_entry", { message: "Forbidden" }));
      return null;
    }
    const data = await pb.collection("questions").update(updatedQuestion.id, updatedQuestion as any, { requestKey: null });
    return data as unknown as SpeakingQuestion;
  } catch (e: any) {
    showError(i18n.t("add_question_page.error_saving_entry", { message: e?.message || String(e) }));
    return null;
  }
};

// Yangi funksiya: Faqat `last_used` maydonini yangilash uchun
export const updateQuestionCooldown = async (questionId: string): Promise<boolean> => {
  const userId = pb.authStore.model?.id;
  
  if (!userId) {
    console.warn("Cannot update cooldown without an authenticated user.");
    // Mehmon rejimida ommaviy savollar uchun cooldownni yangilashga hojat yo'q
    return true;
  }
  
  try {
    const current = await pb.collection("questions").getOne(questionId, { requestKey: null });
    if ((current as any).user_id !== userId) return false;
    await pb.collection("questions").update(questionId, { last_used: new Date().toISOString() } as any, { requestKey: null });
    return true;
  } catch (e: any) {
    console.error(`Error updating cooldown for question ${questionId}:`, e?.message || e);
    return false;
  }
};

export const deleteQuestion = async (id: string): Promise<boolean> => {
  const userId = pb.authStore.model?.id;
  
  if (!userId) {
    console.warn("Attempted to delete a question in guest mode. This action is blocked.");
    return false;
  }
  
  try {
    const current = await pb.collection("questions").getOne(id, { requestKey: null });
    if ((current as any).user_id !== userId) return false;
    await pb.collection("questions").delete(id, { requestKey: null });
    return true;
  } catch (e: any) {
    showError(i18n.t("add_question_page.error_deleting_entry", { message: e?.message || String(e) }));
    return false;
  }
};

export const resetQuestionCooldowns = async (): Promise<boolean> => {
  const userId = pb.authStore.model?.id;

  try {
    const isGuestMode = localStorage.getItem("isGuestMode") === "true";
    const ownerFilter = userId ? `user_id="${userId}"` : `user_id=""`;

    if (!userId && !isGuestMode) return false;

    const list = await pb.collection("questions").getFullList({
      filter: ownerFilter,
      requestKey: null,
    });

    await Promise.all(
      list.map((q: any) =>
        pb.collection("questions").update(q.id, { last_used: null } as any, { requestKey: null })
      )
    );

    return true;
  } catch (e: any) {
    showError(i18n.t("add_question_page.error_saving_entry", { message: e?.message || String(e) }));
    return false;
  }
};

export const getLocalMoodEntries = (): MoodEntry[] => {
  const entriesJson = localStorage.getItem(STORE_MOODS);
  return entriesJson ? JSON.parse(entriesJson) : [];
};

export const saveLocalMoodEntries = (entries: MoodEntry[]) => {
  localStorage.setItem(STORE_MOODS, JSON.stringify(entries));
};

export const addLocalMoodEntry = (entry: Omit<MoodEntry, 'id' | 'date' | 'user_id'>): MoodEntry => {
  const newEntry: MoodEntry = {
    ...entry,
    id: uuidv4(),
    date: new Date().toISOString(),
    user_id: 'local_user',
  };
  
  const entries = getLocalMoodEntries();
  entries.push(newEntry);
  saveLocalMoodEntries(entries);
  
  return newEntry;
};

export const deleteLocalMoodEntry = (id: string) => {
  let entries = getLocalMoodEntries();
  entries = entries.filter(e => e.id !== id);
  saveLocalMoodEntries(entries);
};

interface StoredRecording {
  id: string;
  user_id: string;
  timestamp: string;
  duration: number;
  student_id?: string;
  student_name?: string;
  student_phone?: string;
  videoBlob: Blob; // This is the actual blob stored in IndexedDB
  cloud_url?: string; // Cloud'ga yuklangan videoning ommaviy URL manzili
}

// Yangi: Supabase jadvaliga yozuv metama'lumotlarini kiritish yoki yangilash
export const upsertRecordingMetadataToCloud = async (recording: Omit<RecordedSession, 'video_url' | 'isLocalBlobAvailable'>): Promise<void> => {
  try {
    // PocketBase: recordings collection ichida local_id (unique) orqali upsert qilamiz.
    const filter = `local_id="${recording.id}" && user_id="${recording.user_id}"`;
    try {
      const existing: any = await pb.collection("recordings").getFirstListItem(filter, { requestKey: null });
      await pb.collection("recordings").update(
        existing.id,
        {
          timestamp: recording.timestamp,
          duration: recording.duration,
          student_id: recording.student_id ?? null,
          student_name: recording.student_name ?? null,
          student_phone: recording.student_phone ?? null,
          cloud_url: (recording as any).cloud_url ?? null,
        } as any,
        { requestKey: null }
      );
    } catch {
      await pb.collection("recordings").create(
        {
          local_id: recording.id,
          user_id: recording.user_id,
          timestamp: recording.timestamp,
          duration: recording.duration,
          student_id: recording.student_id ?? null,
          student_name: recording.student_name ?? null,
          student_phone: recording.student_phone ?? null,
          cloud_url: (recording as any).cloud_url ?? null,
        } as any,
        { requestKey: null }
      );
    }
  } catch (e: any) {
    console.error("Error upserting recording metadata to PocketBase:", e?.message || e);
    showError(i18n.t("records_page.error_uploading_to_cloud", { message: e?.message || String(e) }));
  }
};

// PocketBase: cloud record (recordings collection) delete helper
const deleteCloudRecording = async (recordingLocalId: string, userId: string): Promise<boolean> => {
  try {
    const filter = `local_id="${recordingLocalId}" && user_id="${userId}"`;
    const existing: any = await pb.collection("recordings").getFirstListItem(filter, { requestKey: null });
    await pb.collection("recordings").delete(existing.id, { requestKey: null });
    return true;
  } catch (e: any) {
    console.error("[Delete Cloud] Error deleting from PocketBase:", e?.message || e);
    showError(i18n.t("records_page.error_deleting_from_cloud", { message: e?.message || String(e) }));
    return false;
  }
};

export const getLocalRecordings = async (): Promise<RecordedSession[]> => {
  const db = await initDB();
  const storedRecordings: StoredRecording[] = await db.getAll(STORE_RECORDINGS);
  const userId = await getUserId();
  
  let allRecordings: RecordedSession[] = [];
  
  if (userId) {
    // Authenticated user: Fetch from PocketBase recordings collection first
    let data: any[] = [];
    try {
      data = await pb.collection("recordings").getFullList({
        filter: `user_id="${userId}"`,
        requestKey: null,
      });
    } catch (e: any) {
      showError(i18n.t("records_page.error_loading_recordings", { message: e?.message || String(e) }));
      data = [];
    }

    if (data) {
      const cloudRecordingIds = new Set(data.map(rec => rec.local_id));
      const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
      const store = tx.objectStore(STORE_RECORDINGS);
      
      // Filter and potentially delete stale local recordings
      const filteredLocalRecordings: StoredRecording[] = [];
      for (const sRec of storedRecordings) {
        if (sRec.user_id === userId) {
          // Only consider local recordings belonging to the current user
          if (sRec.cloud_url && !cloudRecordingIds.has(sRec.id)) {
            // This local recording has a cloud url but is not in PocketBase anymore.
            console.log(`[getLocalRecordings] Deleting stale local recording from IndexedDB: ${sRec.id}`);
            await store.delete(sRec.id);
            // Do not add to filteredLocalRecordings
          } else {
            filteredLocalRecordings.push(sRec);
          }
        } else {
          // Keep local recordings that belong to other users (e.g., 'local_user' for guest mode)
          filteredLocalRecordings.push(sRec);
        }
      }
      await tx.done; // Commit the transaction after potential deletions
      
      // Now, combine the fresh PocketBase data with the filtered local data
      const combinedIds = new Set<string>();
      
      // Add cloud recordings first
      data.forEach(rec => {
        const localId = rec.local_id;
        if (!localId) return;
        combinedIds.add(localId);
        const localVersion = filteredLocalRecordings.find(sRec => sRec.id === localId);
        const cloudUrl = rec.video ? pb.files.getUrl(rec, rec.video) : (rec.cloud_url || undefined);
        
        allRecordings.push({
          id: localId,
          user_id: rec.user_id,
          timestamp: rec.timestamp,
          duration: Number(rec.duration || 0),
          student_id: rec.student_id || undefined,
          student_name: rec.student_name || undefined,
          student_phone: rec.student_phone || undefined,
          video_url: localVersion ? URL.createObjectURL(localVersion.videoBlob) : cloudUrl,
          cloud_url: cloudUrl,
          isLocalBlobAvailable: !!localVersion,
        });
      });
      
      // Add local-only recordings that are not in cloud
      filteredLocalRecordings.forEach(sRec => {
        if (!combinedIds.has(sRec.id)) {
          allRecordings.push({
            ...sRec,
            video_url: URL.createObjectURL(sRec.videoBlob),
            isLocalBlobAvailable: true, // It's a local recording, so blob is available
          });
        }
      });
    }
  } else {
    // Guest mode or not logged in: Fetch only from IndexedDB
    storedRecordings.forEach(rec => {
      if (rec.user_id === 'local_user') { // Only show 'local_user' recordings in guest mode
        allRecordings.push({
          ...rec,
          video_url: URL.createObjectURL(rec.videoBlob),
          isLocalBlobAvailable: true, // It's a local recording, so blob is available
        });
      }
    });
  }
  
  return allRecordings;
};

export const syncCloudStorageUsage = async (
  userId: string,
  currentUsedBytes?: number | null
): Promise<number> => {
  try {
    // NOTE: PocketBase v0.22 may not support/behave consistently with `fields`.
    // Fetch full records to reliably access `size_bytes`.
    const list: any[] = await pb.collection("recordings").getFullList({
      filter: `user_id="${userId}"`,
      requestKey: null,
    });

    const used = list.reduce((acc, r) => acc + (Number(r.size_bytes) || 0), 0);
    if (typeof currentUsedBytes === "number" && currentUsedBytes === used) {
      return used;
    }

    await pb.collection("users").update(userId, { storage_used_bytes: used } as any, {
      requestKey: null,
    });
    return used;
  } catch (e: any) {
    console.error("[syncCloudStorageUsage] Failed:", e?.message || e);
    return 0;
  }
};

export const getRecordingBlob = async (id: string): Promise<Blob | undefined> => {
  const db = await initDB();
  const recording = await db.get(STORE_RECORDINGS, id);
  return recording?.videoBlob;
};

export const addLocalRecording = async (
  recording: Omit<RecordedSession, 'id' | 'timestamp' | 'user_id' | 'video_url' | 'isLocalBlobAvailable'> & { videoBlob: Blob }
): Promise<string> => {
  const db = await initDB();
  const newRecordingId = uuidv4();
  const currentTimestamp = new Date().toISOString();
  const userId = await getUserId() || 'local_user';
  
  const newRecording: StoredRecording = {
    ...recording,
    id: newRecordingId,
    timestamp: currentTimestamp,
    user_id: userId,
    videoBlob: recording.videoBlob,
    cloud_url: undefined, // Initially, no cloud url
  };
  
  await db.add(STORE_RECORDINGS, newRecording);
  return newRecordingId;
};

export const updateLocalRecordingCloudUrl = async (id: string, cloudUrl: string): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
  const store = tx.objectStore(STORE_RECORDINGS);
  const recording = await store.get(id);
  
  if (recording) {
    recording.cloud_url = cloudUrl;
    await store.put(recording);
  }
  
  await tx.done;
};

export const deleteLocalRecording = async (id: string): Promise<boolean> => {
  const db = await initDB();
  const userId = await getUserId();
  
  let localRecording = await db.get(STORE_RECORDINGS, id);
  let cloudMetadataExists = false;
  let cloudDeletionSuccessful = true; // Assume true if no cloud interaction needed or successful
  
  console.log(`[Delete] Starting deletion for recording ID: ${id}.`);
  
  if (!userId) {
    // If not authenticated, we can only delete local-only recordings.
    // If localRecording has a cloud_url, we cannot delete it from cloud.
    if (localRecording && !localRecording.cloud_url) {
      await db.delete(STORE_RECORDINGS, id);
      console.log(`[Delete] Successfully deleted local-only recording from IndexedDB for ID: ${id} (unauthenticated user).`);
      return true;
    } else if (localRecording && localRecording.cloud_url) {
      showError(i18n.t("records_page.error_deleting_from_cloud", { message: "Foydalanuvchi ID topilmadi. Bulutdan o'chirib bo'lmaydi." }));
      console.error(`[Delete] Cannot delete cloud-linked recording ${id} without authentication.`);
      return false;
    } else {
      console.warn(`[Delete] Recording with ID ${id} not found locally and user not authenticated for cloud check.`);
      return false;
    }
  }
  
  // User is authenticated.
  // First, check if it exists in PocketBase recordings.
  try {
    await pb.collection("recordings").getFirstListItem(`local_id="${id}" && user_id="${userId}"`, { requestKey: null });
    cloudMetadataExists = true;
    console.log(`[Delete] Recording ID ${id} found in PocketBase. Attempting cloud deletion.`);
    cloudDeletionSuccessful = await deleteCloudRecording(id, userId);
  } catch {
    console.log(`[Delete] Recording ID ${id} not found in PocketBase.`);
    cloudDeletionSuccessful = true;
  }
  
  let localDeletionPerformed = false;
  if (localRecording) {
    if (cloudDeletionSuccessful) {
      console.log(`[Delete] Proceeding with local deletion for ID: ${id}.`);
      await db.delete(STORE_RECORDINGS, id);
      localDeletionPerformed = true;
      console.log(`[Delete] Successfully deleted local recording for ID: ${id}`);
    } else {
      // Supabase deletion failed, keep local copy
      showError(i18n.t("records_page.error_cloud_delete_failed_local_kept"));
      console.warn(`[Delete] Supabase deletion failed for recording ID ${id}. Local copy kept in IndexedDB.`);
    }
  } else {
    console.log(`[Delete] Recording ID ${id} not found in local IndexedDB.`);
  }
  
  // Return true if either local deletion happened, or it was a cloud-only recording and cloud deletion succeeded.
  return localDeletionPerformed || (cloudMetadataExists && cloudDeletionSuccessful);
};