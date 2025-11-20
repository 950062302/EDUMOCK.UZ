import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { SpeakingQuestion, MoodEntry, RecordedSession } from './types';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import i18n from '@/i18n';

const DB_NAME = 'edumock_uz_db';
const DB_VERSION = 1;
const STORE_MOODS = 'mood_entries';
const STORE_RECORDINGS = 'recordings';

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
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

export const getSupabaseQuestions = async (): Promise<SpeakingQuestion[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  const isGuestMode = localStorage.getItem("isGuestMode") === "true"; // Mehmon rejimini tekshirish

  let query = supabase.from('questions').select('*');

  if (isGuestMode) {
    // Mehmon rejimida faqat user_id NULL bo'lgan savollarni ko'rsatish
    query = query.is('user_id', null);
  } else if (userId) {
    // Tizimga kirgan foydalanuvchi uchun faqat o'zining savollarini ko'rsatish
    query = query.eq('user_id', userId);
  } else {
    // Tizimga kirmagan va mehmon rejimida bo'lmagan foydalanuvchi uchun savollar yo'q
    return [];
  }

  const { data, error } = await query;

  if (error) {
    showError(i18n.t("add_question_page.error_loading_entries", { message: error.message }));
    return [];
  }
  return data as SpeakingQuestion[];
};

export const addSupabaseQuestion = async (question: Omit<SpeakingQuestion, 'id' | 'date' | 'user_id'>): Promise<SpeakingQuestion | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    showError(i18n.t("add_question_page.error_saving_entry", { message: "Foydalanuvchi ID topilmadi. Mehmon rejimida savol qo'shib bo'lmaydi." }));
    return null;
  }

  const newQuestion = {
    ...question,
    id: uuidv4(),
    date: new Date().toISOString(),
    user_id: userId,
  };

  const { data, error } = await supabase
    .from('questions')
    .insert(newQuestion)
    .select()
    .single();

  if (error) {
    showError(i18n.t("add_question_page.error_saving_entry", { message: error.message }));
    return null;
  }
  return data as SpeakingQuestion;
};

export const updateSupabaseQuestion = async (updatedQuestion: SpeakingQuestion): Promise<SpeakingQuestion | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  let query = supabase
    .from('questions')
    .update(updatedQuestion)
    .eq('id', updatedQuestion.id);

  if (userId) {
    // Authenticated user can only update their own questions
    query = query.eq('user_id', userId);
  } else {
    // Guest user can only update public sample questions (user_id is NULL)
    query = query.eq('user_id', null);
  }

  const { data, error } = await query.select().single();

  if (error) {
    showError(i18n.t("add_question_page.error_saving_entry", { message: error.message }));
    return null;
  }
  return data as SpeakingQuestion;
};

export const deleteSupabaseQuestion = async (id: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  let query = supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    // Guest users cannot delete any questions, even public ones.
    // This prevents guests from modifying the sample data.
    showError(i18n.t("add_question_page.error_deleting_entry", { message: "Mehmon rejimida savolni o'chirib bo'lmaydi." }));
    return false;
  }

  const { error } = await query;

  if (error) {
    showError(i18n.t("add_question_page.error_deleting_entry", { message: error.message }));
    return false;
  }
  return true;
};

export const resetSupabaseQuestionCooldowns = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  let query = supabase
    .from('questions')
    .update({ last_used: null });

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    // Guest user can reset cooldowns for public sample questions
    query = query.eq('user_id', null);
  }

  const { error } = await query;

  if (error) {
    showError(i18n.t("add_question_page.error_saving_entry", { message: error.message }));
    return false;
  }
  return true;
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
  videoBlob: Blob;
  supabase_url?: string; // Supabase URL for the video
}

export const getLocalRecordings = async (): Promise<RecordedSession[]> => {
  const db = await initDB();
  const storedRecordings: StoredRecording[] = await db.getAll(STORE_RECORDINGS);
  
  return storedRecordings.map(rec => ({
    ...rec,
    video_url: URL.createObjectURL(rec.videoBlob),
  }));
};

export const getRecordingBlob = async (id: string): Promise<Blob | undefined> => {
  const db = await initDB();
  const recording = await db.get(STORE_RECORDINGS, id);
  return recording?.videoBlob;
};

export const addLocalRecording = async (
  recording: Omit<RecordedSession, 'id' | 'timestamp' | 'user_id' | 'video_url'> & { videoBlob: Blob, supabase_url?: string }
): Promise<string> => {
  const db = await initDB();
  const newRecording: StoredRecording = {
    ...recording,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    user_id: await getUserId() || 'local_user', // Use actual user ID if available
    videoBlob: recording.videoBlob,
    supabase_url: recording.supabase_url,
  };
  await db.add(STORE_RECORDINGS, newRecording);
  return newRecording.id;
};

export const updateLocalRecordingSupabaseUrl = async (id: string, supabaseUrl: string): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STORE_RECORDINGS, 'readwrite');
  const store = tx.objectStore(STORE_RECORDINGS);
  const recording = await store.get(id);
  if (recording) {
    recording.supabase_url = supabaseUrl;
    await store.put(recording);
  }
  await tx.done;
};

export const deleteLocalRecording = async (id: string) => {
  const db = await initDB();
  const recording = await db.get(STORE_RECORDINGS, id);

  if (recording?.supabase_url) {
    const userId = await getUserId();
    if (userId) {
      const filePath = `${userId}/${id}.webm`; // Assuming .webm format and user_id/recording_id.webm path
      const { error: deleteError } = await supabase.storage
        .from('recordings')
        .remove([filePath]);

      if (deleteError) {
        showError(i18n.t("records_page.error_deleting_from_cloud", { message: deleteError.message }));
      }
    }
  }
  await db.delete(STORE_RECORDINGS, id);
};