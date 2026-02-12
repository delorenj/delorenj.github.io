import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  AbsoluteFill,
} from "remotion";

// --- Network topology ---
// 17 nodes representing microservices, positioned in a loose organic layout
const NODE_LABELS = [
  "Yi",
  "Flume",
  "Bloodbank",
  "iMi",
  "Holocene",
  "Perth",
  "Zellij",
  "Cinder",
  "Lux",
  "Neon",
  "Drift",
  "Shard",
  "Pulse",
  "Hive",
  "Cortex",
  "Relay",
  "Echo",
];

// Fixed node positions (normalized 0-1, will be scaled to canvas)
const NODE_POSITIONS: [number, number][] = [
  [0.50, 0.45], // Yi (center)
  [0.30, 0.30], // Flume
  [0.70, 0.30], // Bloodbank
  [0.20, 0.55], // iMi
  [0.80, 0.55], // Holocene
  [0.40, 0.70], // Perth
  [0.60, 0.70], // Zellij
  [0.15, 0.35], // Cinder
  [0.85, 0.35], // Lux
  [0.35, 0.15], // Neon
  [0.65, 0.15], // Drift
  [0.10, 0.70], // Shard
  [0.90, 0.70], // Pulse
  [0.25, 0.85], // Hive
  [0.75, 0.85], // Cortex
  [0.50, 0.20], // Relay
  [0.50, 0.75], // Echo
];

// Edges: pairs of node indices defining connections
const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [0, 6],
  [0, 15],
  [0, 16],
  [1, 7],
  [1, 9],
  [1, 15],
  [2, 8],
  [2, 10],
  [2, 15],
  [3, 7],
  [3, 11],
  [3, 5],
  [4, 8],
  [4, 12],
  [4, 6],
  [5, 13],
  [5, 16],
  [6, 14],
  [6, 16],
  [9, 10],
  [11, 13],
  [12, 14],
];

// Data packets that travel along edges
type Packet = {
  edgeIndex: number;
  speed: number; // seconds for full traversal
  offset: number; // phase offset in seconds
  size: number;
  brightness: number;
};

const PACKETS: Packet[] = [
  { edgeIndex: 0, speed: 3.2, offset: 0.0, size: 3, brightness: 1.0 },
  { edgeIndex: 1, speed: 2.8, offset: 0.5, size: 2.5, brightness: 0.9 },
  { edgeIndex: 2, speed: 3.5, offset: 1.2, size: 3, brightness: 1.0 },
  { edgeIndex: 3, speed: 4.0, offset: 0.3, size: 2, brightness: 0.8 },
  { edgeIndex: 4, speed: 2.5, offset: 2.0, size: 3.5, brightness: 1.0 },
  { edgeIndex: 5, speed: 3.0, offset: 1.5, size: 2.5, brightness: 0.9 },
  { edgeIndex: 6, speed: 3.8, offset: 0.8, size: 2, brightness: 0.7 },
  { edgeIndex: 7, speed: 2.6, offset: 3.0, size: 3, brightness: 1.0 },
  { edgeIndex: 8, speed: 4.2, offset: 1.0, size: 2, brightness: 0.8 },
  { edgeIndex: 9, speed: 3.0, offset: 2.5, size: 2.5, brightness: 0.9 },
  { edgeIndex: 10, speed: 3.5, offset: 0.2, size: 3, brightness: 1.0 },
  { edgeIndex: 11, speed: 2.9, offset: 1.8, size: 2.5, brightness: 0.9 },
  { edgeIndex: 12, speed: 3.3, offset: 4.0, size: 2, brightness: 0.8 },
  { edgeIndex: 13, speed: 4.5, offset: 0.6, size: 3, brightness: 1.0 },
  { edgeIndex: 14, speed: 2.7, offset: 3.5, size: 2.5, brightness: 0.9 },
  { edgeIndex: 15, speed: 3.1, offset: 2.2, size: 2, brightness: 0.7 },
  { edgeIndex: 16, speed: 3.6, offset: 1.3, size: 3.5, brightness: 1.0 },
  { edgeIndex: 17, speed: 4.0, offset: 0.9, size: 2, brightness: 0.8 },
  { edgeIndex: 18, speed: 2.4, offset: 4.5, size: 3, brightness: 1.0 },
  { edgeIndex: 19, speed: 3.4, offset: 2.8, size: 2.5, brightness: 0.9 },
  { edgeIndex: 20, speed: 3.8, offset: 0.4, size: 2, brightness: 0.8 },
  { edgeIndex: 21, speed: 3.0, offset: 5.0, size: 3, brightness: 1.0 },
  { edgeIndex: 22, speed: 2.5, offset: 1.7, size: 2.5, brightness: 0.9 },
  { edgeIndex: 23, speed: 3.2, offset: 3.3, size: 2, brightness: 0.7 },
  { edgeIndex: 24, speed: 4.1, offset: 0.1, size: 3, brightness: 1.0 },
  { edgeIndex: 25, speed: 3.7, offset: 2.0, size: 2.5, brightness: 0.9 },
  { edgeIndex: 26, speed: 2.8, offset: 4.2, size: 3, brightness: 1.0 },
];

const ACCENT = "#00ff88";
const BG = "#0a0a0a";

export const ThirtyThreeGod: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const time = frame / fps;
  const totalDuration = durationInFrames / fps;

  // Gentle rotation of entire network
  const rotation = interpolate(frame, [0, durationInFrames], [0, 360], {
    extrapolateRight: "clamp",
  });
  // Use a very subtle rotation - just 2 degrees over the full duration for gentle drift
  const subtleRotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, 2],
    { extrapolateRight: "clamp" }
  );

  // Gentle drift offset
  const driftX = Math.sin((time / totalDuration) * Math.PI * 2) * 8;
  const driftY = Math.cos((time / totalDuration) * Math.PI * 2) * 5;

  // Padding for the network area
  const padX = width * 0.08;
  const padY = height * 0.08;
  const netW = width - padX * 2;
  const netH = height - padY * 2;

  // Convert normalized positions to pixel positions
  const nodePixels = NODE_POSITIONS.map(([nx, ny]) => ({
    x: padX + nx * netW,
    y: padY + ny * netH,
  }));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        overflow: "hidden",
      }}
    >
      {/* Subtle radial glow in center */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,255,136,0.03) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          transform: `rotate(${subtleRotation}deg) translate(${driftX}px, ${driftY}px)`,
          transformOrigin: "center center",
        }}
      >
        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const p1 = nodePixels[a];
          const p2 = nodePixels[b];
          // Subtle pulse on edges
          const edgePulse =
            0.08 +
            0.04 * Math.sin(time * 1.5 + i * 0.7);
          return (
            <line
              key={`edge-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={ACCENT}
              strokeOpacity={edgePulse}
              strokeWidth={1}
            />
          );
        })}

        {/* Data packets */}
        {PACKETS.map((packet, i) => {
          const edge = EDGES[packet.edgeIndex];
          if (!edge) return null;
          const p1 = nodePixels[edge[0]];
          const p2 = nodePixels[edge[1]];

          // Progress along edge (loops with period = packet.speed)
          const phase =
            ((time + packet.offset) % packet.speed) / packet.speed;
          // Ping-pong: go forward then backward
          const t = phase < 0.5 ? phase * 2 : 2 - phase * 2;
          const smoothT = t * t * (3 - 2 * t); // smoothstep

          const px = p1.x + (p2.x - p1.x) * smoothT;
          const py = p1.y + (p2.y - p1.y) * smoothT;

          // Packet glow opacity — fade in/out at endpoints
          const glowOpacity =
            packet.brightness *
            (0.5 + 0.5 * Math.sin(t * Math.PI));

          return (
            <g key={`packet-${i}`}>
              {/* Glow */}
              <circle
                cx={px}
                cy={py}
                r={packet.size * 3}
                fill={ACCENT}
                fillOpacity={glowOpacity * 0.15}
              />
              {/* Core */}
              <circle
                cx={px}
                cy={py}
                r={packet.size}
                fill="#ffffff"
                fillOpacity={glowOpacity * 0.9}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {nodePixels.map((pos, i) => {
          // Staggered pulse: each node pulses at a different phase
          const pulsePhase = (time * 0.8 + i * 0.6) % 3.0;
          const pulseIntensity =
            pulsePhase < 1.0
              ? Math.sin(pulsePhase * Math.PI) * 0.6
              : 0;

          const baseRadius = i === 0 ? 6 : 4; // Yi (center) is larger
          const glowRadius = baseRadius + pulseIntensity * 12;
          const nodeOpacity = 0.6 + pulseIntensity * 0.4;

          return (
            <g key={`node-${i}`}>
              {/* Outer glow */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={glowRadius}
                fill={ACCENT}
                fillOpacity={pulseIntensity * 0.25}
              />
              {/* Node ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={baseRadius}
                fill="none"
                stroke={ACCENT}
                strokeWidth={1.5}
                strokeOpacity={nodeOpacity}
              />
              {/* Node core */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={baseRadius * 0.4}
                fill={ACCENT}
                fillOpacity={nodeOpacity * 0.8}
              />
              {/* Label — very subtle */}
              <text
                x={pos.x}
                y={pos.y + baseRadius + 14}
                textAnchor="middle"
                fill={ACCENT}
                fillOpacity={0.12}
                fontSize={10}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight={400}
              >
                {NODE_LABELS[i]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(10,10,10,0.6) 100%)",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
