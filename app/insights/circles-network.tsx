
import CirclesOfCommunication, { CommunicationPartner } from "@/components/CirclesOfCommunication";
import SocialNetworkGraph, { GraphNode } from "@/components/SocialNetworkGraph";
import { useEffect, useState } from "react";

const examplePartners: CommunicationPartner[] = [
  { id: "1", name: "Mum", relationship: "mother", circle: 1 },
  { id: "2", name: "Dad", relationship: "father", circle: 1 },
  { id: "3", name: "Sophie", relationship: "friend", circle: 2 },
  { id: "4", name: "Mr. Lee", relationship: "teacher", circle: 4 },
  { id: "5", name: "Bus Driver", relationship: "bus driver", circle: 3 },
  { id: "6", name: "Shopkeeper", relationship: "shopkeeper", circle: 5 },
];

export default function CirclesAndNetworkPage() {
  const [partners, setPartners] = useState<CommunicationPartner[]>(examplePartners);

  useEffect(() => {
    (async () => {
      try {
        const { readEncryptedJson } = await import("@/lib/secureJsonStore");
        const loaded = await readEncryptedJson<CommunicationPartner[]>("partners.json");
        if (loaded && Array.isArray(loaded) && loaded.length > 0) {
          setPartners(loaded);
        }
      } catch {
        // Fallback to example data
      }
    })();
  }, []);

  // Toast utility for feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  async function refreshPartners() {
    try {
      const { readEncryptedJson } = await import("@/lib/secureJsonStore");
      const loaded = await readEncryptedJson<CommunicationPartner[]>("partners.json");
      if (loaded && Array.isArray(loaded) && loaded.length > 0) {
        setPartners(loaded);
        setToastMsg("Refreshed partners from storage!");
      } else {
        setToastMsg("No partners found in storage.");
      }
    } catch {
      setToastMsg("Failed to refresh partners.");
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Circles of Communication & Social Network</h1>
      <div className="flex justify-center mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          onClick={refreshPartners}
        >
          Refresh
        </button>
      </div>
      {toastMsg && (
        <div className="text-center text-green-700 mb-2">{toastMsg}</div>
      )}
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
        <div className="w-full max-w-xl">
          <CirclesOfCommunication personName="You" partners={partners} />
        </div>
        <div className="w-full max-w-xl">
          <SocialNetworkGraph personName="You" partners={partners as GraphNode[]} />
        </div>
      </div>
      <div className="mt-6 text-center text-gray-500 text-sm">
        {partners === examplePartners ? "Real data integration coming soon. This is a live, interactive preview." : "Loaded your real partners!"}
      </div>
    </div>
  );
}
