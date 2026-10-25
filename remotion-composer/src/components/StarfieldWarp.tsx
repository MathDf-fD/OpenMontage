import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// StarfieldWarp — transition between two chapters (jarvis branch, 25/10/2026).
// A real 3D starfield: every star has a depth z and is projected with
// (x / z, y / z); the camera flies forward, faster in the middle of the
// transition. Covers the cut between two scenes. Deterministic: positions come
// from random(seed), so every frame renders the same on every machine.
// ---------------------------------------------------------------------------

interface StarfieldWarpProps {
  /** Number of stars */
  count?: number;
  /** Accent color for a few stars (theme accent) */
  accentColor?: string;
  /** Secondary tint for a few stars */
  tintColor?: string;
  /** Unique seed per transition */
  seed?: string;
}

const easeInOut = Easing.bezier(0.77, 0, 0.175, 1);

export const StarfieldWarp: React.FC<StarfieldWarpProps> = ({
  count = 260,
  accentColor = "#FF8A3D",
  tintColor = "#C9B8FF",
  seed = "warp",
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const D = Math.max(1, durationInFrames);

  // Envelope: fades in, holds, fades out (on-screen change → ease-in-out)
  const edge = Math.max(1, Math.min(12, Math.floor(D / 3)));
  const opacity = interpolate(frame, [0, edge, D - edge, D], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });

  // Distance travelled: steady cruise + a boost peaking mid-transition
  const base = 0.012;
  const boost = 0.05;
  const travel = (f: number) =>
    base * f + (boost * D * (1 - Math.cos((Math.PI * Math.min(f, D)) / D))) / (2 * Math.PI) * 2;
  const speed = travel(frame + 1) - travel(frame);

  const cx = width / 2;
  const cy = height / 2;
  const focal = Math.max(width, height) * 0.42;

  const lines: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = (random(`${seed}-x-${i}`) - 0.5) * 2;
    const y = (random(`${seed}-y-${i}`) - 0.5) * 2;
    const z0 = random(`${seed}-z-${i}`);
    const t = random(`${seed}-t-${i}`);
    const z = ((((z0 - travel(frame)) % 1) + 1) % 1) + 0.04;
    const zPrev = z + speed * 2.5;
    const sx = cx + (x / z) * focal;
    const sy = cy + (y / z) * focal;
    const px = cx + (x / zPrev) * focal;
    const py = cy + (y / zPrev) * focal;
    if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) continue;
    const near = 1 - Math.min(1, z);
    const stroke = t < 0.05 ? accentColor : t < 0.15 ? tintColor : "#FFFFFF";
    lines.push(
      <line
        key={i}
        x1={px}
        y1={py}
        x2={sx}
        y2={sy}
        stroke={stroke}
        strokeOpacity={0.25 + near * 0.75}
        strokeWidth={0.6 + near * 2.6}
        strokeLinecap="round"
      />
    );
  }

  return (
    <AbsoluteFill
      style={{
        opacity,
        background:
          "radial-gradient(ellipse at center, #241A5C 0%, #120E33 45%, #0B1026 100%)",
      }}
    >
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {lines}
      </svg>
    </AbsoluteFill>
  );
};
