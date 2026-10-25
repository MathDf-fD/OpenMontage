import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// ChapterTitle3D — chapter card that tilts in with real perspective
// (jarvis branch, 25/10/2026). Label first, then the title two frames later
// (stagger), both rising from rotateX(70deg) to flat; exits with a fast fade and
// a slight tilt back. Readable over any image thanks to a soft dark scrim.
// ---------------------------------------------------------------------------

interface ChapterTitle3DProps {
  title: string;
  /** Small label above the title, e.g. "CHAPTER 1" */
  label?: string;
  accentColor?: string;
  textColor?: string;
  fontFamily?: string;
}

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

export const ChapterTitle3D: React.FC<ChapterTitle3DProps> = ({
  title,
  label,
  accentColor = "#FF8A3D",
  textColor = "#FFFFFF",
  fontFamily = "Space Grotesk, Inter, system-ui, sans-serif",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width } = useVideoConfig();

  const enter = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 90, mass: 0.9 } });
  const labelIn = enter(0);
  const titleIn = enter(2);

  const exitFrames = 12;
  const exit = interpolate(frame, [durationInFrames - exitFrames, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  const layer = (p: number) => ({
    opacity: Math.min(p, 1 - exit),
    transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) rotateX(${interpolate(p, [0, 1], [70, 0]) - exit * 25}deg)`,
    transformOrigin: "50% 100%",
  });

  const titleSize = Math.round(width * 0.04); // 77 px in 1920
  const labelSize = Math.round(width * 0.0135); // 26 px in 1920

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
      {/* Soft scrim so the title reads over any picture */}
      <AbsoluteFill
        style={{
          opacity: Math.min(labelIn, 1 - exit) * 0.75,
          background:
            "radial-gradient(ellipse 55% 30% at 50% 50%, rgba(11,16,38,0.78) 0%, rgba(11,16,38,0) 100%)",
        }}
      />
      <div style={{ perspective: 1400, textAlign: "center", fontFamily }}>
        {label && (
          <div
            style={{
              ...layer(labelIn),
              color: accentColor,
              fontSize: labelSize,
              fontWeight: 700,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              marginBottom: Math.round(labelSize * 0.6),
              textShadow: "0 2px 10px rgba(0,0,0,0.55)",
            }}
          >
            {label}
          </div>
        )}
        <div
          style={{
            ...layer(titleIn),
            color: textColor,
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            textShadow: "0 6px 24px rgba(0,0,0,0.6)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            margin: `${Math.round(labelSize * 0.8)}px auto 0`,
            height: 4,
            borderRadius: 2,
            background: accentColor,
            width: interpolate(titleIn, [0, 1], [0, Math.round(width * 0.06)]) * (1 - exit),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
