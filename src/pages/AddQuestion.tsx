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
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Changed to array
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]); // Changed to array
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);

      try {
        const base64 = await fileToBase64(file);
        const newImagePreviewUrls = [...imagePreviewUrls];
        newImagePreviewUrls[index] = base64;
        setImagePreviewUrls(newImagePreviewUrls);
      } catch (error) {
        console.error("Error converting file to Base64:", error);
        showError("Rasmni yuklashda xatolik yuz berdi.");
        const newImagePreviewUrls = [...imagePreviewUrls];
        newImagePreviewUrls[index] = ""; // Clear preview on error
        setImagePreviewUrls(newImagePreviewUrls);
      }
    } else {
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = undefined; // Clear file
      setImageFiles(newImageFiles.filter(Boolean) as File[]); // Remove undefined
      const newImagePreviewUrls = [...imagePreviewUrls];
      newImagePreviewUrls[index] = ""; // Clear preview
      setImagePreviewUrls(newImagePreviewUrls.filter(Boolean)); // Remove empty strings
    }
  };

  // Reset image states when tab changes
  useEffect(() => {
    setImageFiles([]);
    setImagePreviewUrls([]);
  }, [currentTab]);


  const handleAddQuestion = async (part: SpeakingPart) => {
    let base64Images: string[] = [];
    const validImageFiles = imageFiles.filter(Boolean); // Filter out any null/undefined entries
    if (validImageFiles.length > 0) {
      try {
        base64Images = await Promise.all(validImageFiles.map(file => fileToBase64(file)));
      } catch (error) {
        showError("Rasmlarni qayta ishlashda xatolik yuz berdi.");
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
      if (base64Images.length < 2) { // Now requires two images
        showError("Kamida ikkita rasm yuklanmagan.");
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
        imageUrls: base64Images, // Store array
        subQuestions: subQ,
        date: new Date().toISOString(),
      };
      setQuestions(prev => ({
        ...prev,
        [part]: [newQuestion, ...prev[part]],
      }));
      setImageFiles([]);
      setImagePreviewUrls([]);
      setSubQuestionsText("");
      showSuccess(`Savol ${part} ga qo'shildi!`);
    } else if (part === "Part 2") {
      if (base64Images.length < 2 || !questionText.trim()) { // Now requires two images
        showError("Kamida ikkita rasm va savol matni bo'sh bo'lishi mumkin emas.");
        return;
      }
      const newQuestion: Part2Question = {
        id: uuidv4(),
        type: "part2",
        imageUrls: base64Images, // Store array
        question: questionText.trim(),
        date: new Date().toISOString(),
      };
      setQuestions(prev => ({
        ...prev,
        [part]: [newQuestion, ...prev[part]],
      }));
      setImageFiles([]);
      setImagePreviewUrls([]);
      setQuestionText("");
      showSuccess(`Savol ${part} ga qo'shildi!`);
    } else if (part === "Part 3") {
      if (base64Images.length < 2 || !questionText.trim()) { // Now requires two images
        showError("Savol matni va kamida ikkita rasm bo'sh bo'lishi mumkin emas.");
        return;
      }
      const newQuestion: Part3Question = {
        id: uuidv4(),
        type: "part3",
        question: questionText.trim(),
        imageUrls: base64Images, // Store array
        date: new Date().toISOString(),
      };
      setQuestions(prev => ({
        ...prev,
        [part]: [newQuestion, ...prev[part]],
      }));
      setQuestionText("");
      setImageFiles([]);
      setImagePreviewUrls([]);
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
          <div className="space-y-4 mb-4">
            <Label className="text-base">Rasmlar yuklash (2 ta rasm talab qilinadi)</Label>
            {[0, 1].map((idx) => (
              <div key={idx} className="space-y-2 border p-2 rounded-md">
                <Label htmlFor={`image-upload-${part}-${idx}`} className="text-sm">Rasm {idx + 1} yuklash</Label>
                <Input
                  id={`image-upload-${part}-${idx}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, idx)}
                  className="mt-1"
                />
                {imagePreviewUrls[idx] && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Oldindan ko'rish:</p>
                    <img src={imagePreviewUrls[idx]} alt={`Image Preview ${idx + 1}`} className="max-h-32 object-contain rounded-md border p-1" />
                  </div>
                )}
              </div>
            ))}
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
        const part1_1Q = q as Part1_1Question;
        return (
          <div className="flex flex-col items-start flex-grow mr-4">
            <div className="flex gap-2 mb-2">
              {part1_1Q.imageUrls.map((url, idx) => (
                <img key={idx} src={url} alt={`Question image ${idx + 1}`} className="max-h-24 object-contain rounded-md" />
              ))}
            </div>
            <ul className="list-disc list-inside text-sm">
              {part1_1Q.subQuestions.map((subQ, i) => (
                <li key={i}>{subQ}</li>
              ))}
            </ul>
          </div>
        );
      case "part2":
        const part2Q = q as Part2Question;
        return (
          <div className="flex flex-col items-start flex-grow mr-4">
            <div className="flex gap-2 mb-2">
              {part2Q.imageUrls.map((url, idx) => (
                <img key={idx} src={url} alt={`Question image ${idx + 1}`} className="max-h-24 object-contain rounded-md" />
              ))}
            </div>
            <p className="text-sm">{part2Q.question}</p>
          </div>
        );
      case "part3":
        const part3Q = q as Part3Question;
        return (
          <div className="flex flex-col items-start flex-grow mr-4">
            <p className="text-sm mb-2">{part3Q.question}</p>
            <div className="flex gap-2">
              {part3Q.imageUrls.map((url, idx) => (
                <img key={idx} src={url} alt={`Question image ${idx + 1}`} className="max-h-24 object-contain rounded-md" />
              ))}
            </div>
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
              setImageFiles([]);
              setImagePreviewUrls([]);
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