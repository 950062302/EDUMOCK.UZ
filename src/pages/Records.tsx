"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { CefrCentreFooter } from "@/components/CefrCentreFooter";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, PlayCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { RecordedSession, StoredRecording } from "@/lib/types";
import { showError, showSuccess } from "@/utils/toast";
import { getAllRecordingsFromDB, deleteRecordingFromDB } from "@/lib/db";

const Records: React.FC = () => {
  const [recordings, setRecordings] = useState<RecordedSession[]>([]);

  useEffect(() => {
    const objectUrls: string[] = [];

    const loadRecordings = async () => {
      const recordingsFromDb: StoredRecording[] = await getAllRecordingsFromDB();
      console.log("Records: Loaded recordings from IndexedDB:", recordingsFromDb);
      
      const recordingsWithUrls: RecordedSession[] = recordingsFromDb.map(rec => {
        const url = URL.createObjectURL(rec.videoBlob);
        objectUrls.push(url);
        return {
          ...rec,
          url: url,
        };
      });
      setRecordings(recordingsWithUrls);
    };

    loadRecordings();

    return () => {
      console.log("Records: Revoking object URLs on unmount.", objectUrls);
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleDownload = useCallback((recording: RecordedSession) => {
    const timestampFormatted = format(new Date(recording.timestamp), "yyyyMMdd_HHmmss");
    let filename = `mock_test_recording_${timestampFormatted}.webm`;

    if (recording.studentInfo) {
      const studentName = recording.studentInfo.name.replace(/\s/g, '_');
      const studentId = recording.studentInfo.id.replace(/\s/g, '_');
      filename = `mock_test_${studentName}_${studentId}_${timestampFormatted}.webm`;
    }
    
    const a = document.createElement("a");
    a.href = recording.url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleDelete = useCallback(async (timestampToDelete: string) => {
    try {
      const recordingToDelete = recordings.find(rec => rec.timestamp === timestampToDelete);
      if (recordingToDelete) {
        URL.revokeObjectURL(recordingToDelete.url);
      }

      await deleteRecordingFromDB(timestampToDelete);
      
      setRecordings(prevRecordings => prevRecordings.filter(rec => rec.timestamp !== timestampToDelete));

      showSuccess("Yozib olingan sessiya o'chirildi!");
    } catch (error) {
      console.error("Failed to delete recording:", error);
      showError("Yozib olingan videoni o'chirishda xatolik yuz berdi.");
    }
  }, [recordings]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Your Recordings</CardTitle>
            <CardDescription>Review, download, or delete your past mock test sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {recordings.length === 0 ? (
              <p className="text-muted-foreground text-center">No recordings found. Start a mock test to create one!</p>
            ) : (
              <div className="space-y-4">
                {recordings.map((recording, index) => (
                  <Card key={recording.timestamp + index} className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                      <div className="text-left mb-2 sm:mb-0">
                        <h3 className="text-lg font-semibold">
                          {recording.studentInfo?.name ? `O'quvchi: ${recording.studentInfo.name}` : `Yozib olingan sessiya ${recordings.length - index}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(recording.timestamp), "PPP - p")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {Math.floor(recording.duration / 60)}m {recording.duration % 60}s
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const videoWindow = window.open(recording.url, "_blank");
                            if (videoWindow) {
                              videoWindow.focus();
                            } else {
                              showError("Videoni ko'rish uchun pop-uplarga ruxsat bering.");
                            }
                          }}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <PlayCircle className="h-4 w-4" /> Play
                        </Button>
                        <Button
                          onClick={() => handleDownload(recording)} 
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" /> Download
                        </Button>
                        <Button
                          onClick={() => handleDelete(recording.timestamp)}
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </div>
                    {recording.studentInfo && (
                      <div className="text-left text-sm text-muted-foreground mt-2 border-t pt-2">
                        <p><strong>ID:</strong> {recording.studentInfo.id}</p>
                        <p><strong>Telefon:</strong> {recording.studentInfo.phone}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
            <p className="text-sm text-red-500 mt-4 text-center">
              Eslatma: Yozuvlar endi to'g'ridan-to'g'ri brauzeringizning mahalliy xotirasida (IndexedDB) saqlanadi.
              Brauzer ma'lumotlarini tozalash ularni butunlay o'chirib yuboradi.
            </p>
          </CardContent>
        </Card>
      </main>
      <CefrCentreFooter />
    </div>
  );
};

export default Records;