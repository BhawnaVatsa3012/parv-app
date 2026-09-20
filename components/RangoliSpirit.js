"use client";

const PETAL_COLORS = ["#F2A93B", "#D8483B", "#7B6BC9", "#4C8C6B", "#E85D9E", "#F7D9B5"];

export default function RangoliSpirit({ size = 150 }) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        animation: "rangoli-spin 6s linear infinite, rangoli-pulse 1.8s ease-in-out infinite",
      }}
    >
      {PETAL_COLORS.map((c, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 rounded-t-full"
          style={{
            width: size * 0.15,
            height: size * 0.37,
            background: c,
            boxShadow: "0 0 10px rgba(0,0,0,0.15)",
            transformOrigin: "bottom center",
            transform: `translate(-50%, -100%) rotate(${i * 60}deg)`,
          }}
        />
      ))}
      <div
        className="absolute top-1/2 left-1/2 rounded-full"
        style={{
          width: size * 0.23,
          height: size * 0.23,
          marginLeft: -(size * 0.115),
          marginTop: -(size * 0.115),
          background: "radial-gradient(circle, #FFE6A0, #F2A93B 70%)",
          animation: "core-pulse 1.4s ease-in-out infinite",
        }}
      />
    </div>
  );
}
