import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Person } from "@/lib/types";

interface PassportData {
  name: string;
  nickname?: string;
  intro?: string;
  communicationModes?: string;
  communicationStyle?: string;
  communicationBarriers?: string;
  tips?: string;
  medical?: string;
  likes?: string;
  partners: Person[];
}

function formatBulletList(text?: string) {
  if (!text) return null;
  // @ts-expect-error: react-to-print dynamic import typing: Only using index for key
  return (
    <ul className="list-disc ml-6">
      {text.split(/\n|[•\-]/).map(line => line.trim()).filter(Boolean).map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}

export default function PassportsPage() {
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { readEncryptedJson } = await import("@/lib/secureJsonStore");
        const partners = await readEncryptedJson<Person[]>("partners.json");
        const answers = await readEncryptedJson<Record<number, string>>("passport-answers.json");
        setPassport({
          name: answers?.[1] || "",
          nickname: answers?.[2] || undefined,
          intro: answers?.[3] || undefined,
          communicationModes: answers?.[11] || undefined,
          communicationStyle: answers?.[12] || undefined,
          communicationBarriers: answers?.[13] || undefined,
          tips: answers?.[14] || undefined,
          medical: answers?.[15] || undefined,
          likes: answers?.[16] || undefined,
          partners: partners || [],
        });
      } catch {
        setError("Could not load passport data. Complete the questionnaire first.");
      }
    })();
  }, []);

  useEffect(() => {
    setShareSupported(typeof window !== "undefined" && !!navigator.share);
  }, []);

  if (error) {
    return <div className="max-w-2xl mx-auto p-8 text-center text-red-600">{error}</div>;
  }
  if (!passport) {
    return <div className="max-w-2xl mx-auto p-8 text-center text-gray-500">Loading passport...</div>;
  }

  const handlePrint = () => {
    if (passportRef.current) {
      // @ts-expect-error: react-to-print dynamic import typing
      import("react-to-print").then(({ default: print }) => {
        print({
          content: () => passportRef.current,
          documentTitle: `${passport?.name || "passport"}-communication-passport`,
        });
      });
    }
  };

  const handleShare = async () => {
    if (!passport) return;
    const shareText = `Communication Passport for ${passport.name}${passport.nickname ? ` ("${passport.nickname}")` : ""}\n\n` +
      (passport.intro ? `Intro: ${passport.intro}\n` : "") +
      `Important People: ${passport.partners.map(p => p.name).join(", ")}\n` +
      (passport.tips ? `Tips: ${passport.tips}\n` : "");
    try {
      await navigator.share({
        title: `Communication Passport: ${passport.name}`,
        text: shareText,
      });
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div className="flex gap-4 justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          onClick={handlePrint}
        >
          Print / Export as PDF
        </button>
        <button
          className={`px-4 py-2 rounded shadow transition ${shareSupported ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          onClick={shareSupported ? handleShare : undefined}
          disabled={!shareSupported}
          title={shareSupported ? "Share" : "Sharing not supported on this device/browser"}
        >
          Share
        </button>
      </div>
      <div ref={passportRef}>
        <Card className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center mb-2">Communication Passport</h1>
          <section>
            <h2 className="text-xl font-semibold mb-1">Introduction</h2>
            <div>
              <strong>Name:</strong> {passport.name || <span className="text-gray-400">Not provided</span>} {passport.nickname && <span>(Prefers {passport.nickname})</span>}
            </div>
            {passport.intro && <div className="italic mt-2">{passport.intro}</div>}
          </section>
          <hr />
          <section>
            <h2 className="text-xl font-semibold mb-1">Important People</h2>
            <ul className="space-y-2">
              {passport.partners.length > 0 ? passport.partners.map((p) => (
                <li key={p.id} className="border rounded p-2">
                  <strong>{p.name}</strong> ({p.role || "-"})
                  {p.circle && <span> — Circle {p.circle}</span>}
                  {p.communicationFrequency && <span>, {p.communicationFrequency}</span>}
                  {p.communicationStyle && <div>Style: {p.communicationStyle}</div>}
                  {p.commonTopics && <div>Topics: {p.commonTopics.join(", ")}</div>}
                </li>
              )) : <li className="text-gray-400">No partners listed.</li>}
            </ul>
          </section>
          <hr />
          <section>
            <h2 className="text-xl font-semibold mb-1">Communication Preferences & Style</h2>
            {passport.communicationModes && <div><strong>Modes:</strong> {passport.communicationModes}</div>}
            {passport.communicationStyle && <div><strong>Style:</strong> {passport.communicationStyle}</div>}
            {passport.communicationBarriers && <div><strong>Needs/Barriers:</strong> {passport.communicationBarriers}</div>}
            {!(passport.communicationModes || passport.communicationStyle || passport.communicationBarriers) && <div className="text-gray-400">Not provided.</div>}
          </section>
          <hr />
          <section>
            <h2 className="text-xl font-semibold mb-1">Tips for Partners</h2>
            {passport.tips ? formatBulletList(passport.tips) : <div className="text-gray-400">No tips provided.</div>}
          </section>
          <hr />
          <section>
            <h2 className="text-xl font-semibold mb-1">Medical/Accessibility Info</h2>
            {passport.medical || <span className="text-gray-500">None provided.</span>}
          </section>
          <hr />
          <section>
            <h2 className="text-xl font-semibold mb-1">Likes, Dislikes & Interests</h2>
            {passport.likes || <span className="text-gray-500">None provided.</span>}
          </section>
        </Card>
      </div>
    </div>
  );
}

