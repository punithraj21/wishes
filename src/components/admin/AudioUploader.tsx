"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FILE_LIMITS, ALLOWED_AUDIO_FORMATS } from "@/lib/constants";
import Button from "@/components/ui/Button";

interface AudioUploaderProps {
  audioFile: File | null;
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
}

export default function AudioUploader({
  audioFile,
  existingUrl,
  onChange,
  onRemoveExisting,
}: AudioUploaderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "record">("upload");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioPreview(null);
    }
  }, [audioFile]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > FILE_LIMITS.AUDIO_MAX_SIZE) {
        setError("Audio file exceeds 10MB limit");
        return;
      }

      onChange(file);
    },
    [onChange],
  );

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const file = new File([blob], `recording-${Date.now()}.wav`, {
          type: "audio/wav",
        });
        onChange(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      setError("Could not access microphone. Please check permissions.");
    }
  }, [onChange]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const removeAudio = () => {
    onChange(null);
    setAudioPreview(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex bg-white/5 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === "upload"
              ? "bg-violet-500/20 text-violet-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          📁 Upload File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("record")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === "record"
              ? "bg-violet-500/20 text-violet-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          🎙️ Record
        </button>
      </div>

      {/* Upload tab */}
      {activeTab === "upload" && (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl p-6 text-center cursor-pointer transition-all bg-white/5"
          >
            <div className="text-2xl mb-2">🎵</div>
            <p className="text-white font-medium">Click to upload audio</p>
            <p className="text-sm text-gray-400">MP3, WAV • Max 10MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}

      {/* Record tab */}
      {activeTab === "record" && (
        <div className="bg-white/5 rounded-xl p-6 text-center space-y-4">
          {isRecording ? (
            <>
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 font-mono text-lg">
                  {formatTime(recordingTime)}
                </span>
              </div>
              <Button variant="danger" onClick={stopRecording}>
                ⬛ Stop Recording
              </Button>
            </>
          ) : (
            <>
              <div className="text-3xl">🎙️</div>
              <Button variant="primary" onClick={startRecording}>
                🔴 Start Recording
              </Button>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Existing audio */}
      {existingUrl && !audioFile && (
        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
          <audio controls src={existingUrl} className="flex-1 h-10" />
          {onRemoveExisting && (
            <Button variant="ghost" size="sm" onClick={onRemoveExisting}>
              ✕
            </Button>
          )}
        </div>
      )}

      {/* Audio preview */}
      {audioPreview && (
        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3">
          <audio controls src={audioPreview} className="flex-1 h-10" />
          <Button variant="ghost" size="sm" onClick={removeAudio}>
            ✕
          </Button>
        </div>
      )}
    </div>
  );
}
