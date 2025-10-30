"use client";

import React, { useState, useEffect, useCallback } from "react";
import JournalEntryForm from "@/components/JournalEntryForm";
import MoodEntryCard from "@/components/MoodEntryCard";
import { CefrCentreFooter } from "@/components/CefrCentreFooter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showError, showSuccess } from "@/utils/toast";
import { getLocalMoodEntries, addLocalMoodEntry, deleteLocalMoodEntry } from "@/lib/local-db";
import Navbar from "@/components/Navbar"; // Navbar'ni import qilish

interface MoodEntry {
  id: string; // uuid
  mood: string;
  text: string;
  date: string; // ISO string
}

const moods = [
  { label: "All Moods", value: "All" },
  { label: "Happy", value: "Happy" },
  { label: "Neutral", value: "Neutral" },
  { label: "Sad", value: "Sad" },
  { label: "Anxious", value: "Anxious" },
  { label: "Angry", value: "Angry" },
];

const MoodJournal: React.FC = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [filterMood, setFilterMood] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  const fetchEntries = useCallback(() => {
    setIsLoading(true);
    try {
      const data = getLocalMoodEntries();
      setEntries(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error: any) {
      showError(`Yozuvlarni yuklashda xatolik: ${error.message}`);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAddEntry = (mood: string, text: string) => {
    try {
      addLocalMoodEntry({ mood, text });
      fetchEntries(); // Ro'yxatni yangilash
    } catch (error: any) {
      showError(`Yozuvni saqlashda xatolik: ${error.message}`);
    }
  };

  const handleDeleteEntry = (id: string) => {
    try {
      deleteLocalMoodEntry(id);
      showSuccess("Yozuv muvaffaqiyatli o'chirildi!");
      setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
    } catch (error: any) {
      showError(`Yozuvni o'chirishda xatolik: ${error.message}`);
    }
  };

  const filteredEntries = entries.filter((entry) =>
    filterMood === "All" ? true : entry.mood === filterMood,
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8">Mood Journal & Tracker</h1>
        <div className="mb-8">
          <JournalEntryForm onAddEntry={handleAddEntry} />
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Your Past Entries</h2>
          <Select value={filterMood} onValueChange={setFilterMood}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by mood" />
            </SelectTrigger>
            <SelectContent>
              {moods.map((mood) => (
                <SelectItem key={mood.value} value={mood.value}>
                  {mood.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isLoading ? <p className="text-center">Yuklanmoqda...</p> : filteredEntries.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {filterMood === "All" ? "Hali yozuvlar yo'q." : `"${filterMood}" yozuvlari topilmadi.`}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <MoodEntryCard key={entry.id} entry={entry} onDelete={handleDeleteEntry} />
            ))}
          </div>
        )}
      </main>
      <CefrCentreFooter />
    </div>
  );
};

export default MoodJournal;