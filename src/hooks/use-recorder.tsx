"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { StudentInfo, StoredRecording } from "@/lib/types";
import { addRecordingToDB } from "@/lib/db";

const MAX_RECORDING_DURATION_MS = 60 * 60 * 1000; // 60 minutes in milliseconds
const MIME_TYPE = "video/webm; codecs=vp8,opus"; // Using a common WebM codec

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRecordingTimeout = useCallback(() => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
      console.log("Recorder: Recording auto-stop timeout cleared.");
    }
  }, []);

  const stopRecordingProcess = useCallback(() => {
    console.log("Recorder: Stopping recording process (MediaRecorder, screen, mic streams)...");
    clearRecordingTimeout();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      console.log("Recorder: Stopping MediaRecorder. Current state:", mediaRecorderRef.current.state);
      mediaRecorderRef.current.stop();
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      console.log("Recorder: Screen stream stopped.");
      screenStreamRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      console.log("Recorder: Microphone stream stopped.");
      micStreamRef.current = null;
    }

    setIsRecording(false);
    console.log("Recorder: Recording process streams stopped.");
  }, [clearRecordingTimeout]);

  const stopAllStreams = useCallback(() => {
    console.log("Recorder: Stopping ALL streams (including webcam preview)...");
    stopRecordingProcess();

    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      console.log("Recorder: Webcam preview stream stopped.");
    }
    setWebcamStream(null);

    console.log("Recorder: All streams stopped.");
  }, [webcamStream, stopRecordingProcess]);

  useEffect(() => {
    const getWebcamPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setWebcamStream(stream);
        console.log("Recorder: Webcam preview stream obtained.");
      } catch (err) {
        console.error("Recorder: Error getting webcam preview stream:", err);
        showError("Kamera tasvirini olishda xatolik yuz berdi. Kamerangizni tekshiring yoki boshqa ilova ishlatmayotganiga ishonch hosil qiling.");
      }
    };

    getWebcamPreview();

    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
        console.log("Recorder: Webcam preview stream cleaned up on unmount.");
      }
    };
  }, []);

  const startRecording = useCallback(async (studentInfo?: StudentInfo): Promise<boolean> => {
    console.log("Recorder: Attempting to start recording...");
    recordedChunksRef.current = [];

    if (!MediaRecorder.isTypeSupported(MIME_TYPE)) {
      showError(`Yozib olish formati (${MIME_TYPE}) brauzeringiz tomonidan qo'llab-quvvatlanmaydi.`);
      console.error(`Recorder: MIME type ${MIME_TYPE} is not supported.`);
      stopRecordingProcess();
      return false;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      if (!screenStream || screenStream.getVideoTracks().length === 0) {
        showError("Ekran ulashish bekor qilindi yoki video stream olinmadi.");
        stopRecordingProcess();
        return false;
      }
      screenStreamRef.current = screenStream;
      screenStream.addEventListener('ended', () => {
        console.log("Recorder: Screen sharing ended by user or system.");
        showError("Ekran ulashish to'xtatildi. Yozib olish tugatildi.");
        stopRecordingProcess();
      });

      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!micStream || micStream.getAudioTracks().length === 0) {
          showError("Mikrofon ruxsatnomasi berilmadi yoki audio stream olinmadi.");
          stopRecordingProcess();
          return false;
        }
        micStreamRef.current = micStream;
      } catch (micErr) {
        console.error("Recorder: Error getting microphone stream:", micErr);
        showError("Mikrofon ruxsatnomasi berilmadi. Yozib olish uchun mikrofon kerak.");
        stopRecordingProcess();
        return false;
      }

      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      screenStream.getAudioTracks().forEach(track => {
        const source = audioContext.createMediaStreamSource(new MediaStream([track]));
        source.connect(destination);
      });

      micStream.getAudioTracks().forEach(track => {
        const source = audioContext.createMediaStreamSource(new MediaStream([track]));
        source.connect(destination);
      });

      const combinedStream = new MediaStream();
      screenStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      destination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

      if (combinedStream.getTracks().length === 0) {
        showError("Yozib olish uchun hech qanday stream topilmadi. Iltimos, ekran va mikrofon ruxsatnomalarini tekshiring.");
        stopRecordingProcess();
        return false;
      }

      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType: MIME_TYPE,
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log("Recorder: MediaRecorder onstop event triggered.");
        clearRecordingTimeout();
        if (recordedChunksRef.current.length === 0) {
          showError("Yozib olishda hech qanday ma'lumot yig'ilmadi. Iltimos, qayta urinib ko'ring.");
          stopRecordingProcess();
          return;
        }

        const blob = new Blob(recordedChunksRef.current, { type: MIME_TYPE });
        const endTime = Date.now();
        const duration = Math.round((endTime - startTimeRef.current) / 1000);

        const newRecording: StoredRecording = {
          timestamp: new Date().toISOString(),
          duration,
          studentInfo,
          videoBlob: blob,
        };
        
        try {
          await addRecordingToDB(newRecording);
          showSuccess("Yozib olingan video brauzer xotirasiga saqlandi!");
          console.log("Recorder: Recording successfully processed and saved to IndexedDB.");
        } catch (error) {
          console.error("Recorder: Failed to save recording to IndexedDB", error);
          showError("Yozib olingan videoni saqlashda xatolik yuz berdi.");
        }

        recordedChunksRef.current = [];
        setIsRecording(false);

        screenStreamRef.current?.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
        micStreamRef.current?.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      };

      mediaRecorderRef.current.onerror = (event: Event) => {
        console.error("Recorder: MediaRecorder error:", event);
        showError("Yozib olishda xatolik yuz berdi: " + ((event as any).error?.message || "Noma'lum xato"));
        stopRecordingProcess();
      };

      mediaRecorderRef.current.start(1000);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      showSuccess("Recording started!");

      recordingTimeoutRef.current = setTimeout(() => {
        console.log("Recorder: Auto-stopping recording after max duration.");
        stopRecordingProcess();
        showSuccess("Yozib olish maksimal vaqtga yetgani uchun avtomatik to'xtatildi.");
      }, MAX_RECORDING_DURATION_MS);

      return true;
    } catch (err) {
      console.error("Recorder: General error starting recording:", err);
      showError("Yozib olishni boshlashda kutilmagan xatolik yuz berdi. Ruxsatnomalarni tekshiring.");
      setIsRecording(false);
      stopRecordingProcess();
      return false;
    }
  }, [stopRecordingProcess, clearRecordingTimeout]);

  useEffect(() => {
    return () => {
      console.log("Recorder: Component unmounting, performing cleanup.");
      clearRecordingTimeout();

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }

      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        setWebcamStream(null);
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [clearRecordingTimeout, webcamStream]);

  return {
    isRecording,
    startRecording,
    stopRecording: stopRecordingProcess,
    stopAllStreams,
    webcamStream,
  };
};