// src/lib/types.ts

export interface SpeakingQuestion {
  id: string;
  text: string;
  date: string; // ISO string
}

export type SpeakingPart = "Part 1" | "Part 1.1" | "Part 2" | "Part 3";

export interface StudentInfo {
  id: string;
  name: string;
  phone: string;
}

export interface RecordedSession {
  url: string;
  timestamp: string;
  duration: number; // in seconds
  studentInfo?: StudentInfo; // Optional student information
}