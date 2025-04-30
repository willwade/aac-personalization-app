import React from "react";
import dynamic from "next/dynamic";

// Use dynamic import for react-force-graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export type GraphNode = {
  id: string;
  name: string;
  circle: 1 | 2 | 3 | 4 | 5;
  relationship?: string;
};

export type GraphLink = {
  source: string;
  target: string;
  type?: string;
};

export type SocialNetworkGraphProps = {
  personName?: string;
  partners: GraphNode[];
  links?: GraphLink[];
};

const circleColors = [
  "#1e40af", // 1 - Family
  "#0e7490", // 2 - Friends
  "#059669", // 3 - Acquaintances
  "#b45309", // 4 - Paid workers
  "#991b1b", // 5 - Unfamiliar
];

export default function SocialNetworkGraph({ personName = "Person", partners, links = [] }: SocialNetworkGraphProps) {
  // Compose nodes (person + partners)
  const nodes = [
    { id: "person", name: personName, circle: 0 },
    ...partners,
  ];
  // Create links from person to each partner if not specified
  const defaultLinks = partners.map((p) => ({ source: "person", target: p.id, type: p.relationship }));
  const allLinks = links.length > 0 ? links : defaultLinks;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-80 sm:h-96 bg-white dark:bg-gray-900 rounded shadow">
        <ForceGraph2D
          graphData={{ nodes, links: allLinks }}
          nodeLabel={(node: unknown) => node.name || node.id}
          nodeAutoColorBy={(node: unknown) => node.circle}
          nodeCanvasObject={(node: unknown, ctx, globalScale) => {
            const label = node.name || node.id;
            const fontSize = 13 / globalScale;
            ctx.font = `${fontSize}px Inter, Arial`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.id === "person" ? 18 : 13, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.id === "person" ? "#fff" : circleColors[(node.circle ?? 5) - 1] || "#888";
            ctx.fill();
            ctx.strokeStyle = node.id === "person" ? "#1e40af" : "#222";
            ctx.lineWidth = node.id === "person" ? 2.5 : 1.2;
            ctx.stroke();
            ctx.fillStyle = "#222";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y);
          }}
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkWidth={1.2}
          linkColor={() => "#888"}
          width={500}
          height={340}
        />
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">Social Network Graph</div>
    </div>
  );
}
