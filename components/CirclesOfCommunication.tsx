import React from "react";

export type CommunicationPartner = {
  id: string;
  name: string;
  relationship: string;
  circle: 1 | 2 | 3 | 4 | 5;
  notes?: string;
};

export type CirclesOfCommunicationProps = {
  personName?: string;
  partners: CommunicationPartner[];
};

const circleLabels = [
  "Family",
  "Friends",
  "Acquaintances",
  "Paid Workers",
  "Unfamiliar Partners",
];

const circleColors = [
  "#e0e7ff", // Family
  "#bae6fd", // Friends
  "#bbf7d0", // Acquaintances
  "#fde68a", // Paid workers
  "#fecaca", // Unfamiliar
];

export default function CirclesOfCommunication({ personName = "Person", partners }: CirclesOfCommunicationProps) {
  // Group partners by circle
  const grouped = Array.from({ length: 5 }, (_, i) =>
    partners.filter((p) => p.circle === (i + 1))
  );

  // SVG layout constants
  const size = 360;
  const center = size / 2;
  const radii = [40, 75, 110, 145, 180];

  return (
    <div className="w-full flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
        {/* Draw concentric circles */}
        {radii.map((r, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={r}
            fill={circleColors[i]}
            stroke="#555"
            strokeWidth={i === 0 ? 2 : 1}
            opacity={0.7}
          />
        ))}
        {/* Draw labels for each circle */}
        {radii.map((r, i) => (
          <text
            key={i}
            x={center + r * Math.cos(-Math.PI / 4)}
            y={center + r * Math.sin(-Math.PI / 4) - 8}
            textAnchor="middle"
            fontSize={13}
            fill="#333"
            fontWeight={500}
          >
            {circleLabels[i]}
          </text>
        ))}
        {/* Draw person at center */}
        <ellipse
          cx={center}
          cy={center}
          rx={32}
          ry={22}
          fill="#fff"
          stroke="#1e40af"
          strokeWidth={2}
        />
        <text
          x={center}
          y={center + 5}
          textAnchor="middle"
          fontSize={17}
          fontWeight={700}
          fill="#222"
        >
          {personName}
        </text>
        {/* Draw partners in each circle */}
        {grouped.map((circlePartners, i) => {
          const r = radii[i];
          const angleStep = (2 * Math.PI) / Math.max(circlePartners.length, 1);
          return circlePartners.map((p, j) => {
            const angle = -Math.PI / 2 + j * angleStep;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return (
              <g key={p.id}>
                <circle cx={x} cy={y} r={16} fill="#fff" stroke="#222" strokeWidth={1.5} />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={500}
                  fill="#1e293b"
                >
                  {p.name}
                </text>
              </g>
            );
          });
        })}
      </svg>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">Circles of Communication Partners</div>
    </div>
  );
}
