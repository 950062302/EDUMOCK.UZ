import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { SpeakingQuestion, MoodEntry, RecordedSession } from './types';

const DB_NAME = 'cefr_lc_db';
const DB_VERSION = 1;
const STORE_QUESTIONS = 'speaking_questions';
const STORE_MOODS = 'mood_entries';
const STORE_RECORDINGS = 'recordings';

let db: IDBPDatabase;

async function initDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_QUESTIONS)) {
          db.createObjectStore(STORE_QUESTIONS, { keyPath: 'id' });
        }
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

// --- Speaking Questions (localStorage) ---
export const getLocalQuestions = (): SpeakingQuestion[] => {
  const questionsJson = localStorage.getItem(STORE_QUESTIONS);
  return questionsJson ? JSON.parse(questionsJson) : [];
};

export const saveLocalQuestions = (questions: SpeakingQuestion[]) => {
  localStorage.setItem(STORE_QUESTIONS, JSON.stringify(questions));
};

export const addLocalQuestion = (question: Omit<SpeakingQuestion, 'id' | 'date' | 'user_id'>): SpeakingQuestion => {
  const newQuestion = { 
    ...question,
    id: uuidv4(),
    date: new Date().toISOString(),
    user_id: 'local_user', // Lokal rejimda user_id
  } as SpeakingQuestion; // Type assertion to resolve union type issue
  const questions = getLocalQuestions();
  questions.push(newQuestion);
  saveLocalQuestions(questions);
  return newQuestion;
};

export const updateLocalQuestion = (updatedQuestion: SpeakingQuestion) => {
  const questions = getLocalQuestions();
  const index = questions.findIndex(q => q.id === updatedQuestion.id);
  if (index !== -1) {
    questions[index] = updatedQuestion;
    saveLocalQuestions(questions);
  }
};

export const deleteLocalQuestion = (id: string) => {
  let questions = getLocalQuestions();
  questions = questions.filter(q => q.id !== id);
  saveLocalQuestions(questions);
};

export const resetLocalQuestionCooldowns = () => {
  let questions = getLocalQuestions();
  questions = questions.map(q => ({ ...q, last_used: undefined }));
  saveLocalQuestions(questions);
};

// --- Mood Entries (localStorage) ---
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
    user_id: 'local_user', // Lokal rejimda user_id
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

// --- Recordings (IndexedDB) ---

// This is the shape of the object we'll store in IndexedDB
interface StoredRecording {
  id: string;
  user_id: string;
  timestamp: string;
  duration: number;
  student_id?: string;
  student_name?: string;
  student_phone?: string;
  videoBlob: Blob;
}

export const getLocalRecordings = async (): Promise<RecordedSession[]> => {
  const db = await initDB();
  const storedRecordings: StoredRecording[] = await db.getAll(STORE_RECORDINGS);
  
  // Map the stored data to the format the UI expects, creating a fresh temporary URL for each video
  return storedRecordings.map(rec => ({
    ...rec,
    video_url: URL.createObjectURL(rec.videoBlob),
  }));
};

export const addLocalRecording = async (
  recording: Omit<RecordedSession, 'id' | 'timestamp' | 'user_id' | 'video_url'> & { videoBlob: Blob }
): Promise<void> => {
  const db = await initDB();
  const newRecording: StoredRecording = {
    ...recording,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    user_id: 'local_user',
    videoBlob: recording.videoBlob, // Store the raw Blob
  };
  await db.add(STORE_RECORDINGS, newRecording);
};

export const deleteLocalRecording = async (id: string) => {
  const db = await initDB();
  // Just delete the record. URL revocation is handled by the UI component.
  await db.delete(STORE_RECORDINGS, id);
};