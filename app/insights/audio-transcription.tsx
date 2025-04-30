import AudioTranscriber from "@/components/AudioTranscriber";

export default function AudioTranscriptionPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Audio Transcription</h1>
      <AudioTranscriber />
    </div>
  );
}
