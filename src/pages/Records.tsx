"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, PlayCircle } from "lucide-react";
import { format } from "date-fns";

interface RecordedSession {
  url: string;
  timestamp: string;
  duration: number; // in seconds
}

const Records: React.FC = () => {
  const [lastRecording, setLastRecording] = useState<RecordedSession | null>(null);

  useEffect(() => {
    const storedRecording = sessionStorage.getItem("lastRecording");
    if (storedRecording) {
      const parsedRecording: RecordedSession = JSON.parse(storedRecording);
      setLastRecording(parsedRecording);
    }
  }, []);

  const handleDownload = (url: string, timestamp: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock_test_recording_${format(new Date(timestamp), "yyyyMMdd_HHmmss")}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Your Recordings</CardTitle>
            <CardDescription>Review and download your past mock test sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {lastRecording ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Last Recorded Session</h3>
                <p className="text-muted-foreground">
                  Recorded on: {format(new Date(lastRecording.timestamp), "PPP - p")}
                </p>
                <p className="text-muted-foreground">
                  Duration: {Math.floor(lastRecording.duration / 60)}m {lastRecording.duration % 60}s
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
                  <Button
                    onClick={() => {
                      const videoWindow = window.open(lastRecording.url, "_blank");
                      if (videoWindow) {
                        videoWindow.focus();
                      } else {
                        alert("Please allow pop-ups to view the video.");
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <PlayCircle className="h-5 w-5" /> Play Recording
                  </Button>
                  <Button
                    onClick={() => handleDownload(lastRecording.url, lastRecording.timestamp)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" /> Download (.webm)
                  </Button>
                </div>
                <p className="text-sm text-red-500 mt-4">
                  Note: Recordings are saved as .webm format. MP4 conversion is not supported directly in the browser.
                  This recording is temporary and will be lost when you close your browser.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No recordings found. Start a mock test to create one!</p>
            )}
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Records;