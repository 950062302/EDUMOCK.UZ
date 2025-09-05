"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from "@/utils/toast";
import { v4 as uuidv4 } from "uuid";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  SpeakingQuestion,
  SpeakingPart,
  Part1Question,
  Part1_1Question,
  Part2Question,
  Part3Question,
} from "@/lib/types";
import { allSpeakingParts, getSpeakingQuestionStorageKey } from "@/lib/constants";
import { fileToBase64 } from "@/utils/imageUtils"; // Import the new utility function

const SpeakingQuestionManager: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<SpeakingPart>("Part 1");
  const [questionText, setQuestionText] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null); // State for the actual file object
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); // State for Base64 URL for preview
  const [subQuestionsText, setSubQuestionsText] = useState<string>("");

  const [questions, setQuestions] = useState<Record<SpeakingPart, SpeakingQuestion[]>>({
    "Part 1": [],
    "Part 1.1": [],
    "Part 2": [],
    "Part 3": [],
  });

  useEffect(() => {
    const loadedQuestions: Record<SpeakingPart, SpeakingQuestion[]> = {
      "Part 1": [],
      "Part 1.1": [],
      "Part 2": [],
      "Part 3": [],
    };
    allSpeakingParts.forEach(part => {
      const storageKey = getSpeakingQuestionStorageKey(part);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        loadedQuestions[part] = JSON.parse(stored);
      }
    });
    setQuestions(loadedQuestions);
  }, []);

  useEffect(() => {
    allSpeakingParts.forEach(part => {
      const storageKey = getSpeakingQuestionStorageKey(part);
      localStorage.setItem(storageKey, JSON.stringify(questions[part]));
    });
  }, [questions]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      try {
        const base64 = await fileToBase64(file);
        setImagePreviewUrl(base64);
      } catch (error) {
        console.error("Error converting file to Base64:", error);
        showError("Rasmni yuklashda xatolik yuz berdi.");
        setImagePreviewUrl(null);
      }
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleAddQuestion = async (part: SpeakingPart) => {
    let base64Image: string | null = null;
    if (imageFile) {
      try {
        base64Image = await fileToBase64(imageFile);
      } catch (error) {
        showError("Rasmni qayta ishlashda xatolik yuz berdi.");
        return;
      }
    }

    if (part === "Part 1") {
      if (!questionText.trim()) {
        showError("Savol matni bo'sh bo'lishi mumkin emas.");
        return;
      }
      const newQuestion: Part1Question = {
        id: uuidv4(),
        type: "part1",
        text: questionText.trim(),
        date: new Date().toISOString(),
      };
      setQuestions(prev => ({
        ...prev,
        [part]: [newQuestion, ...prev[part]],
      }));
      setQuestionText("");
      showSuccess(`Savol ${part} ga qo'shildi!`);
    } else if (part === "Part 1.1") {
      if (!base64Image) {
        showError("Rasm yuklanmagan.");
        return;
      }
      const subQ = subQuestionsText.split('\n').map(q => q.trim()).filter(q => q.length > 0);
      if (subQ.length === 0) {
        showError("Kamida bitta kichik savol kiritishingiz kerak.");
        return;
      }
      const newQuestion: Part1_1Question = {
        id: uuidv4(),
        type: "part1.1",
        imageUrl: base64Image, // Store Base64 string
        subQuestions: subQ,
        date: new Date().toISOString(),
      };
      setQuestions(prev => ({
        ...prev,
        [part]: [newQuestion, ...prev[part]],
      }));
      setImageFile(null);
      setImagePreviewUrl(null);
      setSubQuestionsText("");
      showSuccess(`Savol ${part} ga qo'shildi!`);
    } else if (part === "Part 2") {
      if (!base64Image || !questionText.trim()) {
        showError("Rasm va savol matni bo'sh bo'lishi mumkin emas.");
        return;
      }
      const newQuestion: Part2Question = {
        id: uuidv4(),
        type: "part2",
        imageUrl: base64Image, // Store Base64 string
        question: questionText.trim(),
        date: new Date().toISOString(),
      };
      setQuestions(prev => ({
        ...prev,
        [part]: [newQuestion, ...prev[part]],
      }));
      setImageFile(null);
      setImagePreviewUrl(null);
      setQuestionText("");
      showSuccess(`Savol ${part} ga qo'shildi!`);
    } else if (part === "Part 3") {
      if (!questionText.trim() || !base64Image) {
        showError("Savol matni va rasm bo'sh bo'lishi mumkin emas.");
        return;
      }
      const newQuestion: Part3Question = {
        id: uuidv4(),
        type: "part3",
        question: questionText.trim(),
        imageUrl: base64Image, // Store Base64 string
        date: new Date().toISOString(),
      };
      setQuestions(prev => ({
        ...prev,
        [part]: [newQuestion, ...prev[part]],
      }));
      setQuestionText("");
      setImageFile(null);
      setImagePreviewUrl(null);
      showSuccess(`Savol ${part} ga qo'shildi!`);
    }
  };

  const handleDeleteQuestion = (part: SpeakingPart, id: string) => {
    setQuestions(prev => ({
      ...prev,
      [part]: prev[part].filter(q => q.id !== id),
    }));
    showSuccess("Savol muvaffaqiyatli o'chirildi!");
  };

  const renderQuestionInput = (part: SpeakingPart) => {
    const isImagePart = ["Part 1.1", "Part 2", "Part 3"].includes(part);
    return (
      <>
        {isImagePart && (
          <div className="space-y-2 mb-4">
            <Label htmlFor={`image-upload-${part}`} className="text-base">Rasm yuklash</Label>
            <Input
              id={`image-upload-${part}`}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1"
            />
            {imagePreviewUrl && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-1">Oldindan ko'rish:</p>
                <img src={imagePreviewUrl} alt="Image Preview" className="max-h-32 object-contain rounded-md border p-1" />
              </div>
            )}
            <p className="text-xs text-red-500 mt-1">
              Eslatma: Rasmlar brauzeringizning mahalliy xotirasida saqlanadi. Katta hajmli rasmlar ilova ish faoliyatini sekinlashtirishi mumkin.
            </p>
          </div>
        )}

        {part === "Part 1" && (
          <>
            <Label htmlFor={`question-text-${part}`} className="text-base">Yangi savol qo'shish</Label>
            <Textarea
              id={`question-text-${part}`}
              placeholder={`Part 1 uchun savol kiriting...`}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </>
        )}

        {part === "Part 1.1" && (
          <>
            <Label htmlFor={`sub-questions-${part}`} className="text-base">Kichik savollar (har birini yangi qatordan kiriting)</Label>
            <Textarea
              id={`sub-questions-${part}`}
              placeholder="1-savol&#10;2-savol&#10;3-savol"
              value={subQuestionsText}
              onChange={(e) => setSubQuestionsText(e.target.value)}
              rows={5}
              className="mt-1"
            />
          </>
        )}

        {part === "Part 2" && (
          <>
            <Label htmlFor={`question-text-${part}`} className="text-base">Asosiy savol</Label>
            <Textarea
              id={`question-text-${part}`}
              placeholder={`Part 2 uchun savol kiriting...`}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </>
        )}

        {part === "Part 3" && (
          <>
            <Label htmlFor={`question-text-${part}`} className="text-base">Asosiy savol</Label>
            <Textarea
              id={`question-text-${part}`}
              placeholder={`Part 3 uchun savol kiriting...`}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </>
        )}
      </>
    );
  };

  const renderQuestionCardContent = (q: SpeakingQuestion) => {
    switch (q.type) {
      case "part1":
        return <p className="text-sm flex-grow mr-4">{q.text}</p>;
      case "part1.1":
        return (
          <div className="flex flex-col items-start flex-grow mr-4">
            {q.imageUrl && <img src={q.imageUrl} alt="Question image" className="max-h-24 object-contain mb-2 rounded-md" />}
            <ul className="list-disc list-inside text-sm">
              {q.subQuestions.map((subQ, i) => (
                <li key={i}>{subQ}</li>
              ))}
            </ul>
          </div>
        );
      case "part2":
        return (
          <div className="flex flex-col items-start flex-grow mr-4">
            {q.imageUrl && <img src={q.imageUrl} alt="Question image" className="max-h-24 object-contain mb-2 rounded-md" />}
            <p className="text-sm">{q.question}</p>
          </div>
        );
      case "part3":
        return (
          <div className="flex flex-col items-start flex-grow mr-4">
            <p className="text-sm mb-2">{q.question}</p>
            {q.imageUrl && <img src={q.imageUrl} alt="Question image" className="max-h-24 object-contain rounded-md" />}
          </div>
        );
      default:
        return <p className="text-sm flex-grow mr-4">Noma'lum savol turi</p>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Speaking savollarini boshqarish</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={(value) => {
              setCurrentTab(value as SpeakingPart);
              setQuestionText("");
              setImageFile(null);
              setImagePreviewUrl(null);
              setSubQuestionsText("");
            }} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {allSpeakingParts.map(part => (
                  <TabsTrigger key={part} value={part}>{part}</TabsTrigger>
                ))}
              </TabsList>

              {allSpeakingParts.map(part => (
                <TabsContent key={part} value={part} className="mt-4">
                  <h3 className="text-xl font-semibold mb-4">{part} savollari</h3>
                  <div className="space-y-4 mb-6 p-4 border rounded-lg bg-card">
                    {renderQuestionInput(part)}
                    <Button onClick={() => handleAddQuestion(part)} className="w-full">
                      Savolni {part} ga qo'shish
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {questions[part].length === 0 ? (
                      <p className="text-center text-muted-foreground">Part {part} uchun hali savollar qo'shilmagan.</p>
                    ) : (
                      questions[part].map((q) => (
                        <div key={q.id} className="flex items-center justify-between p-3 border rounded-md bg-secondary text-secondary-foreground">
                          {renderQuestionCardContent(q)}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{format(new Date(q.date), "MMM dd, yyyy HH:mm")}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(part, q.id)} aria-label="Savolni o'chirish">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default SpeakingQuestionManager;