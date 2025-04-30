"use client";
import React, { useRef, useState } from "react";

export default function AudioTranscriber() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chunks = useRef<Blob[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
      setRecordedBlob(null);
      setRecordedUrl("");
    }
  };

  const handleUpload = async () => {
    const fileToSend = recordedBlob
      ? new File([recordedBlob], "recording.webm", { type: recordedBlob.type })
      : audioFile;
    if (!fileToSend) return;
    setLoading(true);
    setTranscript("");
    const formData = new FormData();
    formData.append("audio", fileToSend);
    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setTranscript(data.transcript);
    } else {
      setTranscript("Transcription failed. Please try again.");
    }
    setLoading(false);
  };

  const startRecording = async () => {
    setTranscript("");
    setAudioFile(null);
    setRecordedBlob(null);
    setRecordedUrl("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new window.MediaRecorder(stream);
      setMediaRecorder(recorder);
      chunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      setRecording(true);
    } catch (err) {
      alert("Could not access microphone: " + err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-4 p-2 sm:p-4 border rounded shadow space-y-4 bg-white dark:bg-gray-900">
      <h2 className="text-xl sm:text-2xl font-bold text-center">Audio Transcription (Local Whisper)</h2>
      <div className="space-y-4">
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="block w-full text-base sm:text-lg px-2 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={recording}
          aria-label="Upload audio file"
        />
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          {!recording ? (
            <button
              className="w-full sm:w-auto px-6 py-3 text-lg bg-green-600 hover:bg-green-700 text-white rounded shadow active:scale-95 transition disabled:opacity-60"
              onClick={startRecording}
              disabled={loading}
              aria-label="Start recording"
            >
              Record Audio
            </button>
          ) : (
            <button
              className="w-full sm:w-auto px-6 py-3 text-lg bg-red-600 hover:bg-red-700 text-white rounded shadow active:scale-95 transition"
              onClick={stopRecording}
              aria-label="Stop recording"
            >
              Stop Recording
            </button>
          )}
        </div>
        {(recordedUrl || audioFile) && (
          <div className="mt-2 flex flex-col items-center">
            <label className="block font-medium mb-1 text-base">Preview:</label>
            <audio
              controls
              src={recordedUrl || (audioFile ? URL.createObjectURL(audioFile) : undefined)}
              className="w-full max-w-xs"
              aria-label="Audio preview"
            />
          </div>
        )}
        <button
          className="w-full px-6 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded shadow active:scale-95 transition disabled:opacity-50 mt-2"
          onClick={handleUpload}
          disabled={(!audioFile && !recordedBlob) || loading}
          aria-label="Transcribe audio"
        >
          {loading ? "Transcribing..." : "Transcribe Audio"}
        </button>
      </div>
      {transcript && (
        <div className="mt-4">
          <h3 className="font-semibold text-lg mb-2">Transcript:</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap text-base overflow-x-auto max-h-64">{transcript}</pre>
        </div>
      )}
    </div>
  );
}

